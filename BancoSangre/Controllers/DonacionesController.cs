
using System;
using System.Data.Entity;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;
using Zen.Barcode;

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
                .Include(d => d.Donante.TipoDocumento).Include(d => d.EstadoDonacion).Include(x => x.DonacionExamenSerologico).ToList();
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
                TieneSerologia = x.DonacionExamenSerologico.Any(es => es.IdResultadoSerologia != 1)
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
        public ActionResult ObtenerDonacionEnBlanco(long idDonante)
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
        {
            try
            {
                var donacionExitente = _db.Donacion.SingleOrDefault(x => x.NroRegistro == nroRegistro);

                donacionExitente.IdEstadoDonacion = idEstadoDonacion;
                _db.SaveChanges();

                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult Guardar(Donacion donacion, bool imprimirEtiquetas, int cantidadEtiquetasExtras)
        {
            try
            {
                if (donacion.Fecha.Date == DateTime.Now.Date)
                    donacion.Fecha = DateTime.Now;

                _db.Donacion.Add(donacion);
                if(imprimirEtiquetas)
                    ImprimirEtiquetas(donacion.NroRegistro, 1 + cantidadEtiquetasExtras);
                _db.SaveChanges();

                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        public ActionResult ObtenerSerologiaParaDonacion(string nroRegistro)
        {
            try
            {
                var serologias = _db.DonacionExamenSerologico.Include(x => x.ResultadoSerologia).Where(x => x.NroRegistro == nroRegistro).ToList();

                if (!serologias.Any()) // Si la donación aún no tiene exámenes cargados, buscará los actualmente activos y los insertará sin resultados a la donación.
                {
                    var nuevosExamenes = _db.ExamenesSerologicos.Where(x => x.EstaActivo).ToList();
                    var donacion = _db.Donacion.FirstOrDefault(x => x.NroRegistro == nroRegistro);
                    if (nuevosExamenes.Any() && donacion != null)
                    {
                        foreach (ExamenesSerologicos examen in nuevosExamenes)
                        {
                            donacion.DonacionExamenSerologico.Add(new DonacionExamenSerologico
                            {
                                NroRegistro = nroRegistro,
                                IdExamenSerologico = examen.IdExamenSerologico,
                                DescripcionExamen = examen.DescripcionExamen,
                                IdResultadoSerologia = 1
                            });
                        }

                        _db.SaveChanges();

                        serologias = _db.DonacionExamenSerologico.Include(x => x.ResultadoSerologia).Where(x => x.NroRegistro == nroRegistro).ToList();
                    }
                }

                var examenes = new object();
                if (serologias.Any()) // La donación ya tiene exámenes cargados. Los traerá y permitirá trabajar sólo con ellos.
                {
                    examenes = serologias.Select(x => new
                    {
                        x.NroRegistro,
                        x.IdExamenSerologico,
                        x.DescripcionExamen,
                        x.IdResultadoSerologia,
                        DescripcionResultado = x.ResultadoSerologia.TextoResultado
                    }).ToList();
                }

                var json = new
                {
                    resultado = true,
                    datos = examenes
                };

                return Json(json, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                var json = new
                {
                    resultado = false
                };

                return Json(json, JsonRequestBehavior.AllowGet);
            }
        }

        public string ObtenerCausalesDeRechazo(long idDonante)
        {
            var UltimaDonacion = _db.Donacion.Include(w => w.DonacionExamenSerologico)
                .Where(x => x.IdDonante == idDonante).OrderByDescending(x => x.Fecha).FirstOrDefault();

            if (UltimaDonacion == null)
                return "";

            var SerologiaCausal = UltimaDonacion.DonacionExamenSerologico
                    .Where(x => x.IdResultadoSerologia == 3)
                    .Select(w => w.DescripcionExamen);

            var Razones = "Nro registro: " + UltimaDonacion.NroRegistro;
            if (SerologiaCausal.Count() > 0)
                Razones += " | Serología causal: " + string.Join(" -- ", SerologiaCausal.ToArray()) + " |";
            return Razones;
        }

        private void ImprimirEtiquetas(string nroRegistro, int cantidad)
        {
            try
            {
                // Genera la imagen del código de barra.
                var maxheight = nroRegistro.Length;
                var barcode128 = BarcodeDrawFactory.Code128WithChecksum;
                var codigoBarra = barcode128.Draw(nroRegistro, maxheight);
                using (var memStream = new MemoryStream())
                {
                    codigoBarra.Save(memStream, ImageFormat.Png);

                    var file = new FileStream(Server.MapPath("~/Content/Imagenes/codigoBarra.png"), FileMode.Create, FileAccess.Write);
                    memStream.WriteTo(file);
                    file.Close();
                    memStream.Close();
                }

                // Genera las etiquetas.
                ImprimirEtiquetasEstandar(nroRegistro);
                ImprimirEtiquetasExtras(nroRegistro, cantidad);

                // Elimina la imagen del código de barra.
                System.IO.File.Delete(Server.MapPath("~/Content/Imagenes/codigoBarra.png"));
            }
            catch (Exception)
            {}
        }

        private void ImprimirEtiquetasEstandar(string nroRegistro)
        {
            var archivos = new []{ Server.MapPath("~/Content/Imagenes/Etiqueta1.lbx"), Server.MapPath("~/Content/Imagenes/Etiqueta2.lbx") };
            var etiqueta = new bpac.Document();
            foreach (string archivo in archivos) {
                if (etiqueta.Open(archivo))
                {
                    var txtNroRegistro = etiqueta.GetObject("txtValorRegistro");
                    if(txtNroRegistro != null)
                        txtNroRegistro.Text = nroRegistro;

                    var imgCodigo = etiqueta.GetObject("imgCodigo");
                    if (imgCodigo != null)
                    {
                        imgCodigo.SetData(0, Server.MapPath("~/Content/Imagenes/codigoBarra.png"), 4);
                    }

                    etiqueta.StartPrint("", bpac.PrintOptionConstants.bpoDefault);
                    etiqueta.PrintOut(1, bpac.PrintOptionConstants.bpoDefault);
                    etiqueta.EndPrint();
                    etiqueta.Close();
                }
            }
        }

        private void ImprimirEtiquetasExtras(string nroRegistro, int cantidad)
        {
            var archivos = new[] { Server.MapPath("~/Content/Imagenes/Etiqueta3.lbx") };
            var etiqueta = new bpac.Document();
            foreach (string archivo in archivos)
            {
                if (etiqueta.Open(archivo))
                {
                    var txtNroRegistro = etiqueta.GetObject("txtValorRegistro");
                    if (txtNroRegistro != null)
                        txtNroRegistro.Text = nroRegistro;

                    var imgCodigo = etiqueta.GetObject("imgCodigo");
                    if (imgCodigo != null)
                    {
                        imgCodigo.SetData(0, Server.MapPath("~/Content/Imagenes/codigoBarra.png"), 4);
                    }

                    etiqueta.StartPrint("", bpac.PrintOptionConstants.bpoDefault);
                    etiqueta.PrintOut(cantidad, bpac.PrintOptionConstants.bpoDefault);
                    etiqueta.EndPrint();
                    etiqueta.Close();
                }
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
