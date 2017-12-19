using System.Linq;
using System.Web.Mvc;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
    public class DestinoDonacionsController : Controller
    {
        private bancosangreEntities db = new bancosangreEntities();

        // GET: DestinoDonacions
        public ActionResult Index()
        {
            return View(db.DestinoDonacion.ToList());
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
