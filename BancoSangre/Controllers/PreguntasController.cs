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
	public class PreguntasController : Controller
	{
		private bancosangreEntities db = new bancosangreEntities();

		// GET: Preguntas
		[Authorize]
		public ActionResult Index()
		{
			return View(db.Pregunta.ToList());
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
