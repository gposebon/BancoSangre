using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
    public class DonantesController : Controller
    {
        private bancosangreEntities db = new bancosangreEntities();

        // GET: Donantes
        public ActionResult Index()
        {
            var donante = db.Donante.Include(d => d.Localidad).Include(d => d.Provincia).Include(d => d.TipoDocumento).Include(d => d.EstadoDonante);
            return View(donante.ToList());
        }

        // GET: Donantes/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Donante donante = db.Donante.Find(id);
            if (donante == null)
            {
                return HttpNotFound();
            }
            return View(donante);
        }

        // GET: Donantes/Create
        public ActionResult Create()
        {
            ViewBag.IdLocalidad = new SelectList(db.Localidad, "IdLocalidad", "NombreLocalidad");
            ViewBag.IdProvincia = new SelectList(db.Provincia, "IdProvincia", "NombreProvincia");
            ViewBag.IdTipoDoc = new SelectList(db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc");
            ViewBag.IdEstadoDonante = new SelectList(db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado");
            return View();
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
                db.Donante.Add(donante);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.IdLocalidad = new SelectList(db.Localidad, "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
            ViewBag.IdProvincia = new SelectList(db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
            ViewBag.IdTipoDoc = new SelectList(db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
            ViewBag.IdEstadoDonante = new SelectList(db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
            return View(donante);
        }

        // GET: Donantes/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Donante donante = db.Donante.Find(id);
            if (donante == null)
            {
                return HttpNotFound();
            }
            ViewBag.IdLocalidad = new SelectList(db.Localidad, "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
            ViewBag.IdProvincia = new SelectList(db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
            ViewBag.IdTipoDoc = new SelectList(db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
            ViewBag.IdEstadoDonante = new SelectList(db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
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
                db.Entry(donante).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.IdLocalidad = new SelectList(db.Localidad, "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
            ViewBag.IdProvincia = new SelectList(db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
            ViewBag.IdTipoDoc = new SelectList(db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
            ViewBag.IdEstadoDonante = new SelectList(db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
            return View(donante);
        }

        // GET: Donantes/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Donante donante = db.Donante.Find(id);
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
            Donante donante = db.Donante.Find(id);
            db.Donante.Remove(donante);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
