
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using BancoSangre.Models;
using System.ComponentModel.DataAnnotations;

namespace BancoSangre.Controllers
{
	public class DonantesController : Controller
	{
		private readonly bancosangreEntities _db = new bancosangreEntities();

        // GET: Donantes
        public ActionResult Index()
		{
			var donante = _db.Donante.Include(d => d.Localidad).Include(d => d.Provincia).Include(d => d.TipoDocumento).Include(d => d.EstadoDonante);
			return View(donante.ToList());
		}

		// GET: Donantes/Details/5
		public ActionResult Details(int? id)
		{
			if (id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			Donante donante = _db.Donante.Find(id);
			if (donante == null)
			{
				return HttpNotFound();
			}
			return View(donante);
		}

		// GET: Donantes/Create
		public ActionResult Create()
		{
			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(0), "IdLocalidad", "NombreLocalidad");
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia");
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc");
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado");
			return View();
		}

		public ActionResult TraerLocalidades(int? idProvincia)
		{
			return Json(ObtenerLocalidades(idProvincia), JsonRequestBehavior.AllowGet);

		}

		private IList ObtenerLocalidades(int? idProvincia)
		{
			return _db.Localidad.Where(s => s.IdProvincia == idProvincia || s.IdLocalidad == 0).OrderBy(x => x.NombreLocalidad)
				.Select(x => new { x.IdLocalidad, x.NombreLocalidad }).ToList();
		}

		// POST: Donantes/Create
		// Para protegerse de ataques de publicación excesiva, habilite las propiedades específicas a las que desea enlazarse. Para obtener 
		// más información vea https://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Create([Bind(Include = "IdDonante,IdTipoDoc,NroDoc,Apellido,Nombre,Domicilio,IdProvincia,IdLocalidad,Telefono,Ocupacion,Edad,GrupoSanguineo,RegistroFHA,NumeroRegistroFHA,RegistroRP,NumeroRegistroRP,RegistroRR,NumeroRegistroRR,IdEstadoDonante")] Donante donante)
		{
			if (ModelState.IsValid)
			{
				if (donante.IdLocalidad == 0)
				{
					_db.Localidad.Add(new Localidad { NombreLocalidad = "Elortondo", IdProvincia = donante.IdProvincia });
					_db.SaveChanges();
					donante.IdLocalidad = _db.Localidad.Single(x => x.NombreLocalidad == "Elortondo" && x.IdProvincia == donante.IdProvincia).IdLocalidad;
				}

				_db.Donante.Add(donante);
				_db.SaveChanges();
				return RedirectToAction("Index");
			}

			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(donante.IdProvincia), "IdLocalidad", "NombreLocalidad");
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
			return View(donante);
		}

		// GET: Donantes/Edit/5
		public ActionResult Edit(int? id)
		{
			if (id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			Donante donante = _db.Donante.Find(id);
			if (donante == null)
			{
				return HttpNotFound();
			}
			ViewBag.IdLocalidad = new SelectList(_db.Localidad, "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
			return View(donante);
		}

		// POST: Donantes/Edit/5
		// Para protegerse de ataques de publicación excesiva, habilite las propiedades específicas a las que desea enlazarse. Para obtener 
		// más información vea https://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Edit([Bind(Include = "IdDonante,IdTipoDoc,NroDoc,Apellido,Nombre,Domicilio,IdProvincia,IdLocalidad,Telefono,Ocupacion,Edad,GrupoSanguineo,RegistroFHA,NumeroRegistroFHA,RegistroRP,NumeroRegistroRP,RegistroRR,NumeroRegistroRR,IdEstadoDonante")] Donante donante)
		{
			if (ModelState.IsValid)
			{
				_db.Entry(donante).State = EntityState.Modified;
				_db.SaveChanges();
				return RedirectToAction("Index");
			}
			ViewBag.IdLocalidad = new SelectList(_db.Localidad, "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
			return View(donante);
		}

		// GET: Donantes/Delete/5
		public ActionResult Delete(int? id)
		{
			if (id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			Donante donante = _db.Donante.Find(id);
			if (donante == null)
			{
				return HttpNotFound();
			}
			return View(donante);
		}

		// POST: Donantes/Delete/5
		[HttpPost, ActionName("Delete")]
		[ValidateAntiForgeryToken]
		public ActionResult DeleteConfirmed(int id)
		{
			Donante donante = _db.Donante.Find(id);
			_db.Donante.Remove(donante);
			_db.SaveChanges();
			return RedirectToAction("Index");
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
