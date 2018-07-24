
using System;
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
            var donaciones = _db.Donacion.OrderByDescending(x => x.Fecha).Include(d => d.DestinoDonacion).Include(d => d.Donante)
                .Include(d => d.Donante.TipoDocumento).Include(d => d.EstadoDonacion).Include(d => d.DonacionExamenSerologico).ToList();
            var donacionesJson = donaciones.Select(x => new
            {
                x.NroRegistro,
                x.IdCuestionario,
                Fecha = x.Fecha.ToString("dd/MM/yyyy"),
                DocDonante = x.Donante.TipoDocumento.DescripcionTipoDoc + ": " + x.Donante.NroDoc,
                NomreDonante = x.Donante.Nombre + " " + x.Donante.Apellido,
                x.Material,
                x.Cantidad,
                x.Peso,
                Destino = x.DestinoDonacion.DescripcionDestino,
                x.IdEstadoDonacion,
                Estado = x.EstadoDonacion != null ? x.EstadoDonacion.DescripcionEstado : "",
                Examenes = x.DonacionExamenSerologico.Any()
                                ? x.DonacionExamenSerologico.Select(y => new { y.IdExamenSerologico, y.ExamenesSerologicos.DescripcionExamen })
                                : null
            }).ToList();

            var estadosDonacion = _db.EstadoDonacion.Select(x => new { x.IdEstadoDonacion, x.DescripcionEstado }).ToList();

            var json = new
            {
                cantidad = donacionesJson.Count,
                data = donacionesJson,
                EstadosDonacion = estadosDonacion.OrderBy(x => x.IdEstadoDonacion)
            };

            return Json(json, JsonRequestBehavior.AllowGet);
        }

        [Authorize]
        public ActionResult ObtenerDonacionEnBlanco(int idDonante)
        {
            var donante = _db.Donante.Include(x => x.TipoDocumento).First(x => x.IdDonante == idDonante);
            var donacion = new
            {
                IdDestino = -1,
                NroRegistro = "",
                Fecha = DateTime.Now.ToString("dd/MM/yyyy"),
                IdDonante = idDonante,
                Documento = donante.TipoDocumento.DescripcionTipoDoc + ": " + donante.NroDoc,
                Donante = donante.Nombre + " " + donante.Apellido,
                Material = "Sangre entera",
                Cantidad = "600 ml",
                Peso = "",
                IdEstadoDonacion = 2,
                IdCuestionario = Guid.Empty
            };

            var destinos = _db.DestinoDonacion.Select(x => new { x.IdDestino, x.DescripcionDestino }).ToList();
            destinos.Add(new { IdDestino = -1, DescripcionDestino = "Seleccione Destino" });
            var estadosDonacion = _db.EstadoDonacion.Select(x => new { x.IdEstadoDonacion, x.DescripcionEstado }).ToList();

            var json = new
            {
                Donacion = donacion,
                Destinos = destinos.OrderBy(x => x.IdDestino),
                EstadosDonacion = estadosDonacion.OrderBy(x => x.IdEstadoDonacion)
            };

            return Json(json, JsonRequestBehavior.AllowGet);
        }

        [Authorize]
        public ActionResult ObtenerNroRegistro(int idDestino)
        {
            var prefijo = _db.DestinoDonacion.Find(idDestino).Prefijo;

            var nrosRegistros = _db.Donacion.Where(x => x.IdDestino == idDestino).Select(x => x.NroRegistro.Replace(x.DestinoDonacion.Prefijo, "")).ToList().ConvertAll(int.Parse);
            var ultimoNroRegistro = nrosRegistros.OrderByDescending(x => x).FirstOrDefault();

            //Si no existe aun donación para el destino, devuelve 0
            var nroRegistro = prefijo + (ultimoNroRegistro + 1);

            return Json(nroRegistro, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult ActualizarDonacion(string nroRegistro, int idEstadoDonacion)
        { try
            {
                var donacionExitente = _db.Donacion.SingleOrDefault(x => x.NroRegistro == nroRegistro);

                donacionExitente.IdEstadoDonacion = idEstadoDonacion;
                _db.SaveChanges();

                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult Guardar(Donacion donacion)
        {
            try
            {
                if (donacion.Fecha.Date == DateTime.Now.Date)
                    donacion.Fecha = DateTime.Now;

                _db.Donacion.Add(donacion);
                _db.SaveChanges();

                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        // GET: Donaciones
        [Authorize]
        public ActionResult Grilla()
        {
            return View();
        }

        [Authorize]
        public ActionResult Ingresar()
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
