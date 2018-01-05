using System;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
	public class PreguntasController : Controller
	{
		private readonly bancosangreEntities _db;

		public PreguntasController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerPreguntas()
		{
			var preguntas = _db.Pregunta.OrderByDescending(x => x.Mostrar).ThenBy(x => x.Orden)
				.Select(x => new
				{
					x.IdPregunta,
					x.TextoPregunta,
					x.EsTitulo,
					x.NuevaLinea,
					x.LineaCompleta,
					x.EsCerrada,
					x.CausalRechazo,
					x.Mostrar,
					x.Orden
				})
				.ToList();

			if (!preguntas.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var result = preguntas;
			var json = new
			{
				cantidad = preguntas.Count,
				data = result
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult RemoverPregunta(int id)
		{
			try
			{
				var actual = _db.Pregunta
					.FirstOrDefault(x => x.IdPregunta == id);
				if (actual == null)
					return Json("La pregunta que intenta remover no existe en nuestra Base de Datos.", JsonRequestBehavior.AllowGet);

				_db.Pregunta.Remove(actual);
				_db.SaveChanges();
				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (DbUpdateException)
			{
				return Json("La pregunta no puede ser removida porque ya ha sido incluída en uno o más cuestionario/s de paciente/s.", JsonRequestBehavior.AllowGet);
			}
			catch (Exception)
			{
				return Json("Se produjo un error al intentar remover la pregunta.", JsonRequestBehavior.AllowGet);
			}
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarPregunta(Pregunta pregunta)
		{
			try
			{
				if (pregunta.IdPregunta == 0)
				{
					_db.Pregunta.Add(pregunta);
				}
				else
				{
					var preguntaActual = _db.Pregunta.FirstOrDefault(x => x.IdPregunta == pregunta.IdPregunta);
					if (preguntaActual == null)
						throw new Exception();

					preguntaActual.TextoPregunta = pregunta.TextoPregunta;
					preguntaActual.EsTitulo = pregunta.EsTitulo;
					preguntaActual.NuevaLinea = pregunta.NuevaLinea;
					preguntaActual.LineaCompleta = pregunta.LineaCompleta;
					preguntaActual.EsCerrada = pregunta.EsCerrada;
					preguntaActual.CausalRechazo = pregunta.CausalRechazo;
					preguntaActual.Mostrar = pregunta.Mostrar;
					preguntaActual.Orden = pregunta.Orden;
				}

				_db.SaveChanges();
				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				return Json(ex.Message, JsonRequestBehavior.AllowGet);
			}
		}

		[HttpPost]
		[Authorize]
		public ActionResult ActualizarOrdenPreguntas(Pregunta preguntaMovida, Pregunta preguntaSolapa)
		{
			try
			{
				var preguntaActual = _db.Pregunta.FirstOrDefault(x => x.IdPregunta == preguntaMovida.IdPregunta);
				if (preguntaActual == null)
					throw new Exception();

				preguntaActual.Orden = preguntaMovida.Orden;

				if (preguntaSolapa != null)
				{
					var preguntaSolapada = _db.Pregunta.FirstOrDefault(x => x.IdPregunta == preguntaSolapa.IdPregunta);
					if (preguntaSolapada == null)
						throw new Exception();

					preguntaSolapada.Orden = preguntaSolapa.Orden;
				}

				_db.SaveChanges();
				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				return Json(ex.Message, JsonRequestBehavior.AllowGet);
			}
		}
		
		#endregion

		// GET: Preguntas
		[Authorize]
		public ActionResult Index()
		{
			return View();
		}
		
		protected override void Dispose(bool disposing)
		{
			if (disposing)
			{
				_db.Dispose();
			}
			base.Dispose(disposing);
		}
	}
}
