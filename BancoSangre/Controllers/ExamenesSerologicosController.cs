using System;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
    public class ExamenesSerologicosController : Controller
    {
        private readonly bancosangreEntities _db;

        public ExamenesSerologicosController()
        {
            _db = new bancosangreEntities();
            _db.Configuration.ProxyCreationEnabled = false;
        }

        #region Api

        [HttpGet]
        [Authorize]
        public ActionResult ObtenerExamenes()
        {
            var examenes = _db.ExamenesSerologicos.OrderBy(x => x.DescripcionExamen)
                .Select(x => new
                {
                    x.IdExamenSerologico,
                    x.DescripcionExamen
                })
                .ToList();

            if (!examenes.Any())
                return Json(null, JsonRequestBehavior.AllowGet);

            var resultado = examenes;
            var json = new
            {
                cantidad = examenes.Count,
                data = resultado
            };

            return Json(json, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult RemoverExamen(int id)
        {
            try
            {
                var actual = _db.ExamenesSerologicos
                    .FirstOrDefault(x => x.IdExamenSerologico == id);
                if (actual == null)
                    return Json("El examen que intenta remover no existe en nuestra Base de Datos.", JsonRequestBehavior.AllowGet);

                _db.ExamenesSerologicos.Remove(actual);
                _db.SaveChanges();
                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException)
            {
                return Json("El examen no puede ser removido porque ya ha sido incluído en una o más serologías de donantes.", JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json("Se produjo un error al intentar remover el examen.", JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult GuardarExamen(ExamenesSerologicos examen)
        {
            try
            {
                if (examen.IdExamenSerologico == 0)
                {
                    _db.ExamenesSerologicos.Add(examen);
                }
                else
                {
                    var examenActual = _db.ExamenesSerologicos.FirstOrDefault(x => x.IdExamenSerologico == examen.IdExamenSerologico);
                    if (examenActual == null)
                        throw new Exception();

                    examenActual.DescripcionExamen = examen.DescripcionExamen;
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

        // GET: ExamenesSerologicos
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
