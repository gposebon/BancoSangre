using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;
using System.Data.Entity.Infrastructure;
using System;

namespace BancoSangre.Controllers
{
	public class DestinoDonacionsController : Controller
	{
		private readonly bancosangreEntities _db;

		public DestinoDonacionsController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerDestinos()
		{
			var destinos = _db.DestinoDonacion.OrderBy(x => x.DescripcionDestino)
				.Select(x => new
				{
					x.IdDestino,
					x.DescripcionDestino,
					x.Direccion,
					x.Ciudad,
					x.Provincia,
					x.Prefijo,
					x.Telefono,
					
				})
				.ToList();

			if (!destinos.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var result = destinos;
			var json = new
			{
				cantidad = destinos.Count,
				data = result
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult RemoverDestino(int id)
		{
			try
			{
				var actual = _db.DestinoDonacion
					.FirstOrDefault(x => x.IdDestino == id);
				if (actual == null)
					return Json("El destino que intenta remover no existe en nuestra Base de Datos.", JsonRequestBehavior.AllowGet);

				_db.DestinoDonacion.Remove(actual);
				_db.SaveChanges();
				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (DbUpdateException)
			{
				return Json("El destino no puede ser removido porque ya ha sido incluído en una o más donaciones.", JsonRequestBehavior.AllowGet);
			}
			catch (Exception)
			{
				return Json("Se produjo un error al intentar remover el destino.", JsonRequestBehavior.AllowGet);
			}
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarDestino(DestinoDonacion destino)
		{
			try
			{
				if (destino.IdDestino == 0)
				{
					_db.DestinoDonacion.Add(destino);
				}
				else
				{
					var destinoActual = _db.DestinoDonacion.FirstOrDefault(x => x.IdDestino == destino.IdDestino);
					if (destinoActual == null)
						throw new Exception();

					destinoActual.DescripcionDestino = destino.DescripcionDestino;
					destinoActual.Direccion = destino.Direccion;
					destinoActual.Ciudad = destino.Ciudad;
					destinoActual.Provincia = destino.Provincia;
					destinoActual.Prefijo = destino.Prefijo;
					destinoActual.Telefono = destino.Telefono;
					}

				_db.SaveChanges();

				var json = new
				{
					resultado = true
				};

				return Json(json, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				var json = new
				{
					data = ex.Message,
					resultado = false
				};

				return Json(json, JsonRequestBehavior.AllowGet);
			}
		}

	#endregion

		// GET: DestinoDonacions
		public ActionResult Grilla()
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
