
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
	public class DonacionesController : Controller
	{
		private readonly bancosangreEntities _db;

		public DonacionesController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerDonaciones()
		{
			var donaciones = _db.Donacion.Include(d => d.DestinoDonacion).Include(d => d.Donante).Include(d => d.Donante.TipoDocumento).ToList();
			var donacionesJson = donaciones.Select(x => new
			{
				x.NroRegistro,
				DocDonante = x.Donante.TipoDocumento.DescripcionTipoDoc + ": " + x.Donante.NroDoc,
				NomreDonante = x.Donante.Nombre + " " + x.Donante.Apellido,
				x.Material,
				x.Cantidad,
				Destino = x.DestinoDonacion.DescripcionDestino
			}).ToList();

			var json = new
			{
				cantidad = donacionesJson.Count,
				data = donacionesJson
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		#endregion

		// GET: Donaciones
		public ActionResult Grilla()
		{
			return View();
		}

		// GET: Donaciones/Create
		public ActionResult Ingresar(int idDonante)
		{
			var donante = _db.Donante.Include(x => x.TipoDocumento).FirstOrDefault(x => x.IdDonante == idDonante);
			var donacion = new Donacion { NroRegistro = "HPIT1", IdDonante = idDonante, Donante = donante};
			ViewBag.IdDestino = new SelectList(_db.DestinoDonacion, "IdDestino", "DescripcionDestino");
			
			return View(donacion);
		}

		// POST: Donaciones/Create
		// Para protegerse de ataques de publicación excesiva, habilite las propiedades específicas a las que desea enlazarse. Para obtener 
		// más información vea http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Ingresar([Bind(Include = "NroRegistro,IdDonante,IdDestino,Material,Cantidad")] Donacion donacion)
		{
			if (ModelState.IsValid)
			{
				_db.Donacion.Add(donacion);
				_db.SaveChanges();
				return RedirectToAction("Grilla");
			}

			ViewBag.IdDestino = new SelectList(_db.DestinoDonacion, "IdDestino", "DescripcionDestino", donacion.IdDestino);
			ViewBag.IdDonante = new SelectList(_db.Donante, "IdDonante", "Apellido", donacion.IdDonante);
			return View(donacion);
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
