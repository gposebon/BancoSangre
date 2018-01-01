
using System;
using System.Collections;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using System.Web.Routing;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
	public class DonantesController : Controller
	{
		private readonly bancosangreEntities _db;

		public DonantesController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerDonantes()
		{
			var donantes = _db.Donante.Include(t => t.TipoDocumento).Include(t => t.Localidad).Include(t => t.Provincia).Include(t => t.EstadoDonante)
				.OrderBy(x => x.Apellido).ThenBy(x => x.Nombre)
				.Select(x => new
				{
					x.IdDonante,
					x.TipoDocumento.DescripcionTipoDoc,
					x.NroDoc,
					x.Apellido,
					x.Nombre,
					x.IdGrupoFactor,
					x.GrupoFactor.DescripcionGrupoFactor,
					x.Localidad.NombreLocalidad,
					x.Provincia.NombreProvincia,
					x.IdEstadoDonante,
					x.EstadoDonante.DescripcionEstado,
					x.DiferidoHasta
				})
				.ToList();

			if (!donantes.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var result = donantes;
			var json = new
			{
				count = donantes.Count,
				data = result
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult RemoverDonante(int id)
		{
			try
			{
				var actual = _db.Donante
					.FirstOrDefault(x => x.IdDonante == id);
				if (actual == null)
					return Json("El donante que intenta remover no existe en nuestra Base de Datos.", JsonRequestBehavior.AllowGet);

				_db.Donante.Remove(actual);
				_db.SaveChanges();
				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (DbUpdateException)
			{
				return Json("El donante no puede ser removido porque ya ha realizado donaciones.", JsonRequestBehavior.AllowGet);
			}
			catch (Exception)
			{
				return Json("Se produjo un error al intentar remover el donante.", JsonRequestBehavior.AllowGet);
			}
		}

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
				NuevaLinea = x.NuevaLinea
			}).ToList();

			var cuestionarioDonante = new CuestionarioDonante
			{
				Preguntas = preguntas,
				Donante = _db.Donante.Find(idDonante),
				Fecha = DateTime.Now.ToString("dd/MM/yyyy")
			};

			var json = new
			{
				data = cuestionarioDonante
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarCuestionarioParaDonante(CuestionarioDonante cuestionarioDonante)
		{
			try
			{
				var idDonante = cuestionarioDonante.Donante.IdDonante;

				var nuevoCuestionario = new Cuestionario
				{
					IdCuestionario = Guid.NewGuid(),
					IdDonante = cuestionarioDonante.Donante.IdDonante,
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

		// GET: Donantes
		[Authorize]
		public ActionResult Index()
		{
			return View();
		}

		// GET: Donantes/Create
		[Authorize]
		public ActionResult Create()
		{
			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(0), "IdLocalidad", "NombreLocalidad");
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia");
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc");
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado");
			ViewBag.IdGrupoFactor = new SelectList(_db.GrupoFactor, "IdGrupoFactor", "DescripcionGrupoFactor");
			return View();
		}

		public ActionResult TraerLocalidades(int? idProvincia)
		{
			return Json(ObtenerLocalidades(idProvincia), JsonRequestBehavior.AllowGet);

		}

		private IList ObtenerLocalidades(int? idProvincia)
		{
			return _db.Localidad.Where(s => s.IdProvincia == idProvincia || s.IdLocalidad == -1).OrderBy(x => x.NombreLocalidad)
				.Select(x => new { x.IdLocalidad, x.NombreLocalidad }).ToList();
		}

		// POST: Donantes/Create
		// Para protegerse de ataques de publicación excesiva, habilite las propiedades específicas a las que desea enlazarse. Para obtener 
		// más información vea https://go.microsoft.com/fwlink/?LinkId=317598.
		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Create([Bind(Include = "DonanteActual, OtraLocalidad, AccionPosterior")] DonanteOtraLocalidad donanteConOtraLocalidad)
		{
			var idProvincia = donanteConOtraLocalidad.DonanteActual.IdProvincia;
			if (ModelState.IsValid)
			{
				if (donanteConOtraLocalidad.DonanteActual.IdLocalidad == -1)
				{
					var nombreOtraLocalidad = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(donanteConOtraLocalidad.OtraLocalidad.Trim().ToLower());
					_db.Localidad.Add(new Localidad { NombreLocalidad = nombreOtraLocalidad, IdProvincia = idProvincia });
					_db.SaveChanges();
					donanteConOtraLocalidad.DonanteActual.IdLocalidad = _db.Localidad
						.Single(x => x.NombreLocalidad == donanteConOtraLocalidad.OtraLocalidad && x.IdProvincia == idProvincia).IdLocalidad;
				}
				donanteConOtraLocalidad.DonanteActual.Fecha = DateTime.Now;

				_db.Donante.Add(donanteConOtraLocalidad.DonanteActual);
				_db.SaveChanges();

				if (donanteConOtraLocalidad.AccionPosterior == "cuestionario")
				{
					var parametros = new RouteValueDictionary { { "idDonante", donanteConOtraLocalidad.DonanteActual.IdDonante } };
					return RedirectToAction("Cuestionario", parametros);
				}

				return RedirectToAction("Index");
			}

			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(idProvincia), "IdLocalidad", "NombreLocalidad");
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", idProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donanteConOtraLocalidad.DonanteActual.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donanteConOtraLocalidad.DonanteActual.IdEstadoDonante);
			ViewBag.IdGrupoFactor = new SelectList(_db.GrupoFactor, "IdGrupoFactor", "DescripcionGrupoFactor", donanteConOtraLocalidad.DonanteActual.IdGrupoFactor);
			return View(donanteConOtraLocalidad);
		}

		// GET: Donantes/Edit/5
		[Authorize]
		public ActionResult Edit(int? id)
		{
			if (id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			var donante = _db.Donante.Find(id);
			var donanteOtraLocalidad = new DonanteOtraLocalidad { DonanteActual = donante };

			if (donante == null)
			{
				return HttpNotFound();
			}
			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(donante.IdProvincia), "IdLocalidad", "NombreLocalidad", donante.IdLocalidad);
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", donante.IdProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donante.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donante.IdEstadoDonante);
			ViewBag.IdGrupoFactor = new SelectList(_db.GrupoFactor, "IdGrupoFactor", "DescripcionGrupoFactor", donante.IdGrupoFactor);
			return View(donanteOtraLocalidad);
		}

		// POST: Donantes/Edit/5
		// Para protegerse de ataques de publicación excesiva, habilite las propiedades específicas a las que desea enlazarse. Para obtener 
		// más información vea https://go.microsoft.com/fwlink/?LinkId=317598.
		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public ActionResult Edit([Bind(Include = "DonanteActual, OtraLocalidad, AccionPosterior")] DonanteOtraLocalidad donanteConOtraLocalidad)
		{
			var idProvincia = donanteConOtraLocalidad.DonanteActual.IdProvincia;
			if (ModelState.IsValid)
			{
				if (donanteConOtraLocalidad.DonanteActual.IdLocalidad == -1)
				{
					var nombreOtraLocalidad = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(donanteConOtraLocalidad.OtraLocalidad.Trim().ToLower());
					_db.Localidad.Add(new Localidad { NombreLocalidad = nombreOtraLocalidad, IdProvincia = idProvincia });
					_db.SaveChanges();
					donanteConOtraLocalidad.DonanteActual.IdLocalidad = _db.Localidad
						.Single(x => x.NombreLocalidad == donanteConOtraLocalidad.OtraLocalidad && x.IdProvincia == idProvincia).IdLocalidad;
				}

				_db.Entry(donanteConOtraLocalidad.DonanteActual).State = EntityState.Modified;
				_db.SaveChanges();

				if (donanteConOtraLocalidad.AccionPosterior == "cuestionario")
				{
					var parametros = new RouteValueDictionary { { "idDonante", donanteConOtraLocalidad.DonanteActual.IdDonante } };
					return RedirectToAction("Cuestionario", parametros);
				}

				return RedirectToAction("Index");
			}
			ViewBag.IdLocalidad = new SelectList(ObtenerLocalidades(idProvincia), "IdLocalidad", "NombreLocalidad", donanteConOtraLocalidad.DonanteActual.IdLocalidad);
			ViewBag.IdProvincia = new SelectList(_db.Provincia, "IdProvincia", "NombreProvincia", idProvincia);
			ViewBag.IdTipoDoc = new SelectList(_db.TipoDocumento, "IdTipoDoc", "DescripcionTipoDoc", donanteConOtraLocalidad.DonanteActual.IdTipoDoc);
			ViewBag.IdEstadoDonante = new SelectList(_db.EstadoDonante, "IdEstadoDonante", "DescripcionEstado", donanteConOtraLocalidad.DonanteActual.IdEstadoDonante);
			ViewBag.IdGrupoFactor = new SelectList(_db.GrupoFactor, "IdGrupoFactor", "DescripcionGrupoFactor", donanteConOtraLocalidad.DonanteActual.IdGrupoFactor);

			return View(donanteConOtraLocalidad);
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
