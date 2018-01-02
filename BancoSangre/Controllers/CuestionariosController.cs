using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
	public class CuestionariosController : Controller
	{
		private readonly bancosangreEntities _db;

		public CuestionariosController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionarioParaDonante(int idDonante)
		{
			var preguntasCuestionarioActual = _db.Pregunta.Where(x => x.Mostrar).OrderBy(x => x.Orden).ToList();
			var preguntas = preguntasCuestionarioActual.Select(x => new PreguntaCuestionario
			{
				IdPregunta = x.IdPregunta,
				TextoPregunta = x.TextoPregunta,
				Orden = x.Orden,
				CausalRechazo = x.CausalRechazo,
				EsCerrada = x.EsCerrada,
				EsTitulo = x.EsTitulo,
				LineaCompleta = x.LineaCompleta,
				NuevaLinea = x.NuevaLinea,
				RespuestaCerrada = null,
				RespuestaAbierta = ""
			}).ToList();

			var donante = idDonante != -1 
				? _db.Donante.Include(x => x.Localidad).Include(x => x.Provincia).Include(x => x.GrupoFactor).SingleOrDefault(x => x.IdDonante == idDonante)
				: null;

			var cuestionarioDonante = new CuestionarioDonante
			{
				IdDonante = idDonante,
				DatosDemograficos = ObtenerDatosDemograficos(donante),
				Preguntas = preguntas,
				Fecha = DateTime.Now.ToString("dd/MM/yyyy")
			};

			var json = new
			{
				data = cuestionarioDonante
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionarioPorId(Guid idCuestionario)
		{
			var cuestionario = _db.Cuestionario.Include(x => x.Donante).Include(x => x.Donante.Localidad).Include(x => x.Donante.Provincia).Include(x => x.Donante.GrupoFactor)
				.Include(x => x.PreguntaCuestionario).SingleOrDefault(x => x.IdCuestionario == idCuestionario);

			if (cuestionario == null)
				return Json(null, JsonRequestBehavior.AllowGet);

			var cuestionarioDonante = new CuestionarioDonante
			{
				IdDonante = cuestionario.Donante.IdDonante,
				DatosDemograficos = ObtenerDatosDemograficos(cuestionario.Donante),
				Preguntas = cuestionario.PreguntaCuestionario.OrderBy(x => x.Orden).Select(x => new PreguntaCuestionario
				{
					IdPregunta = x.IdPregunta,
					TextoPregunta = x.TextoPregunta,
					Orden = x.Orden,
					CausalRechazo = x.CausalRechazo,
					EsCerrada = x.EsCerrada,
					EsTitulo = x.EsTitulo,
					LineaCompleta = x.LineaCompleta,
					NuevaLinea = x.NuevaLinea,
					RespuestaCerrada = x.RespuestaCerrada,
					RespuestaAbierta = x.RespuestaAbierta
				}).ToList(),
				Fecha = cuestionario.Fecha.ToString("dd/MM/yyyy")
			};

			var json = new
			{
				data = cuestionarioDonante
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		private static IList<DatoDemografico> ObtenerDatosDemograficos(Donante donante)
		{
			var edad = "";
			if (donante != null && donante.FechaNacimiento != null)
			{
				var tiempoInicial = new DateTime(1, 1, 1);
				var dif = DateTime.Now - (DateTime) donante.FechaNacimiento;
				edad = ((tiempoInicial + dif).Year - 1).ToString();
			}

			return new[] {
				new DatoDemografico { Etiqueta = "Apellido y nombre:", Dato = donante != null ? donante.Apellido + ", " + donante.Nombre : "" },
				new DatoDemografico { Etiqueta = "Edad:", Dato = edad },
				new DatoDemografico { Etiqueta = "Domicilio:", Dato = donante != null ? donante.Domicilio : "" },
				new DatoDemografico { Etiqueta = "Fecha:", Dato = DateTime.Now.ToString("dd/MM/yyyy") },
				new DatoDemografico { Etiqueta = "Localidad:", Dato = donante != null ? donante.Localidad.NombreLocalidad + " (" + donante.Provincia.NombreProvincia + ")" : "" },
				new DatoDemografico { Etiqueta = "DNI:", Dato = donante != null ? donante.TipoDocumento + " " + donante.NroDoc : "" },
				new DatoDemografico { Etiqueta = "Teléfono:", Dato = donante != null ? donante.Telefono : "" },
				new DatoDemografico { Etiqueta = "Fecha nacimiento:", Dato = donante != null 
					? (donante.FechaNacimiento.HasValue ? ((DateTime)donante.FechaNacimiento).ToString("dd/MM/yyyy") : "") 
					: "" },
				new DatoDemografico { Etiqueta = "Ocupación:", Dato = donante != null ? donante.Ocupacion : "" },
				new DatoDemografico { Etiqueta = "Lugar nacimiento:", Dato = donante != null ? donante.LugarNacimiento : "" },
				new DatoDemografico { Etiqueta = "Grupo RH:", Dato = donante != null ? donante.GrupoFactor.DescripcionGrupoFactor : "" },
				new DatoDemografico { Etiqueta = "Código postal:", Dato = donante != null ? donante.Localidad.CodigoPostal.ToString() : "" },
			};
		}

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionariosDeDonante(int idDonante)
		{
			var cuestionarios = _db.Cuestionario.Where(x => x.IdDonante == idDonante).OrderByDescending(x => x.Fecha).Include(x => x.Donante).ToList();

			if (!cuestionarios.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var resultado = new
			{
				Donante = new { cuestionarios[0].Donante.IdDonante, cuestionarios[0].Donante.Apellido, cuestionarios[0].Donante.Nombre },
				Cuestionarios = cuestionarios.Select(x => new { x.IdCuestionario, Fecha = x.Fecha.ToString("dd/MM/yyyy") })
			};

			var json = new
			{
				count = cuestionarios.Count,
				data = resultado
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarCuestionarioParaDonante(CuestionarioDonante cuestionarioDonante)
		{
			try
			{
				var idDonante = cuestionarioDonante.IdDonante;

				var nuevoCuestionario = new Cuestionario
				{
					IdCuestionario = Guid.NewGuid(),
					IdDonante = cuestionarioDonante.IdDonante,
					Fecha = DateTime.Now
				};

				_db.Cuestionario.Add(nuevoCuestionario);
				_db.SaveChanges();

				var ultimoCuestionario = _db.Cuestionario.Where(x => x.IdDonante == idDonante).OrderByDescending(x => x.Fecha).FirstOrDefault();
				if (ultimoCuestionario != null)
				{
					foreach (var pregunta in cuestionarioDonante.Preguntas)
					{
						pregunta.IdPreguntaCuestionario = Guid.NewGuid();
						pregunta.IdCuestionario = ultimoCuestionario.IdCuestionario;
						_db.PreguntaCuestionario.Add(pregunta);
					}
					_db.SaveChanges();
				}

				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (Exception)
			{
				return Json(false, JsonRequestBehavior.AllowGet);
			}
		}

		#endregion

		// GET: Cuestionarios
		[Authorize]
		public ActionResult CuestionariosExistentes(int idDonante)
		{
			return View();
		}

		[Authorize]
		public ActionResult Cuestionario(int idDonante)
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
