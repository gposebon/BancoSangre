
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
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
				.Include(t => t.Donacion)
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
					FechaUltimaDonacion = x.Donacion.Any() ? (DateTime?)x.Donacion.OrderByDescending(w => w.Fecha).FirstOrDefault().Fecha : null,
					x.IdEstadoDonante,
					x.EstadoDonante.DescripcionEstado,
					x.DiferidoHasta
				})
                .OrderByDescending(d => d.FechaUltimaDonacion).ThenBy(x => x.Apellido).ThenBy(x => x.Nombre)
                .ToList();

			if (!donantes.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var json = new
			{
				cantidad = donantes.Count,
				data = donantes
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult RemoverDonante(long idDonante)
		{
			try
			{
				var actual = _db.Donante
					.FirstOrDefault(x => x.IdDonante == idDonante);
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
		public ActionResult ObtenerDonante(long idDonante)
		{

			var donante = _db.Donante.Include(t => t.TipoDocumento).Include(t => t.Localidad).Include(t => t.Provincia).Include(t => t.EstadoDonante)
                .Include(t => t.Donacion).FirstOrDefault(x => x.IdDonante == idDonante);

			var donanteJson = new
			{
				IdDonante = idDonante,
				IdTipoDoc = donante == null ? -1 : donante.IdTipoDoc,
				NroDoc = donante == null ? "" : donante.NroDoc.ToString(),
				Apellido = donante == null ? "" : donante.Apellido,
				Nombre = donante == null ? "" : donante.Nombre,
				IdGrupoFactor = donante == null ? -1 : donante.IdGrupoFactor,
				Domicilio = donante == null ? "" : donante.Domicilio,
				IdProvincia = donante == null ? -1 : donante.IdProvincia,
				IdLocalidad = donante == null ? -2 : donante.IdLocalidad,
				IdEstadoDonante = donante == null ? -1 : donante.IdEstadoDonante,
				DiferidoHasta = donante == null ? null : donante.DiferidoHasta,
				LugarNacimiento = donante == null ? "" : donante.LugarNacimiento,
				OtraLocalidad = "",
				Edad = "",
				Fecha = donante == null ? DateTime.Now : donante.Fecha,
				FechaNacimiento = donante == null ? null : donante.FechaNacimiento,
				Telefono = donante == null ? "" : donante.Telefono,
				Ocupacion = donante == null ? "" : donante.Ocupacion,
                FechaUltimaDonacion = donante != null && donante.Donacion.Any() ? (DateTime?)donante.Donacion.OrderByDescending(w => w.Fecha).FirstOrDefault().Fecha : null,
            };

			if (idDonante != 0 && donante == null)
				return Json(null, JsonRequestBehavior.AllowGet);

			var tiposDocumentos = _db.TipoDocumento.Select(x => new {x.IdTipoDoc, x.DescripcionTipoDoc}).ToList();
			tiposDocumentos.Add(new { IdTipoDoc = -1, DescripcionTipoDoc = "Seleccione Tipo Doc" });
			var gruposFactores = _db.GrupoFactor.Select(x => new { x.IdGrupoFactor, x.DescripcionGrupoFactor }).ToList();
			gruposFactores.Add(new { IdGrupoFactor = -1, DescripcionGrupoFactor = "Seleccione Grupo y Factor" });
			var provincias = _db.Provincia.Select(x => new { x.IdProvincia, x.NombreProvincia }).ToList();
			provincias.Add(new { IdProvincia = -1, NombreProvincia = "Seleccione Provincia" });
			var localidades = ObtenerLocalidades(donanteJson.IdProvincia);
			var estadosDonantes = _db.EstadoDonante.Select(x => new { x.IdEstadoDonante, x.DescripcionEstado }).ToList();
			estadosDonantes.Add(new { IdEstadoDonante = -1, DescripcionEstado = "Seleccione Estado" });

			var json = new
			{
				data = new
				{
					Donante = donanteJson,
					TiposDocumentos = tiposDocumentos.OrderBy(x => x.IdTipoDoc),
					GruposFactores = gruposFactores.OrderBy(x => x.IdGrupoFactor),
					Provincias = provincias.OrderBy(x => x.IdProvincia),
					Localidades = localidades.OrderBy(x => x.IdLocalidad),
					EstadosDonantes = estadosDonantes.OrderBy(x => x.IdEstadoDonante)
				}
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[Authorize]
		private List<ItemLocalidad> ObtenerLocalidades(int? idProvincia)
		{
            var localidades = _db.Localidad.Where(s => s.IdProvincia == idProvincia || s.IdLocalidad == -1).OrderBy(x => x.NombreLocalidad)
				.Select(x => new ItemLocalidad { IdLocalidad = x.IdLocalidad, NombreLocalidad = x.NombreLocalidad }).ToList();
            localidades.Add(new ItemLocalidad { IdLocalidad = -2, NombreLocalidad = "Seleccione Localidad" });
            return localidades.OrderBy(x => x.IdLocalidad).ToList();
        }
		
		[HttpGet]
		[Authorize]
		public ActionResult TraerLocalidades(int? idProvincia)
		{
			return Json(ObtenerLocalidades(idProvincia), JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarDonante(Donante donante, string otraLocalidad)
		{
			try
			{
				var idDonante = donante.IdDonante;

				//Otra Localidad
				var idProvincia = donante.IdProvincia;

				if (donante.IdLocalidad == -1)
				{
					var nombreOtraLocalidad = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(otraLocalidad.Trim().ToLower());
					_db.Localidad.Add(new Localidad { NombreLocalidad = nombreOtraLocalidad, IdProvincia = idProvincia });
					_db.SaveChanges();

					donante.IdLocalidad = _db.Localidad.Single(x => x.NombreLocalidad == otraLocalidad && x.IdProvincia == idProvincia).IdLocalidad;
				}

				//Donante
				if (donante.IdDonante == 0)
				{
					//Insertar
					donante.Fecha = DateTime.Now;

					_db.Donante.Add(donante);
					_db.SaveChanges();

					idDonante = _db.Donante.First(x => x.Apellido == donante.Apellido && x.Nombre == donante.Nombre
						&& x.IdTipoDoc == donante.IdTipoDoc && x.NroDoc == donante.NroDoc).IdDonante;
				}
				else
				{
					//Actualizar
					var donanteActual = _db.Donante.Find(donante.IdDonante);
					if (donanteActual == null)
						throw new Exception();

					donanteActual.Nombre = donante.Nombre;
					donanteActual.DiferidoHasta = donante.DiferidoHasta;
					donanteActual.Domicilio = donante.Domicilio;
					donanteActual.Fecha = donante.Fecha;
					donanteActual.Apellido = donante.Apellido;
					donanteActual.FechaNacimiento = donante.FechaNacimiento;
					donanteActual.IdEstadoDonante = donante.IdEstadoDonante;
					donanteActual.IdGrupoFactor = donante.IdGrupoFactor;
					donanteActual.IdLocalidad = donante.IdLocalidad;
					donanteActual.IdProvincia = donante.IdProvincia;
					donanteActual.LugarNacimiento = donante.LugarNacimiento;
					donanteActual.IdTipoDoc = donante.IdTipoDoc;
					donanteActual.NroDoc = donante.NroDoc;
					donanteActual.Telefono = donante.Telefono;
					donanteActual.Ocupacion = donante.Ocupacion;
				}

				_db.SaveChanges();

				var json = new
				{
					data = idDonante,
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

		// GET: Donantes
		[Authorize]
		public ActionResult Grilla()
		{
			return View();
		}

		// Recibe idDonante en 0 para diferenciar Ingresar y Editar de Grilla
		[Authorize]
		public ActionResult Ingresar(int? idDonante)
		{
			return View();
		}

		[Authorize]
		public ActionResult Editar(int? idDonante)
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

	internal class ItemLocalidad
	{
		public int IdLocalidad { get; set; }
		public string NombreLocalidad { get; set; }
	}
}