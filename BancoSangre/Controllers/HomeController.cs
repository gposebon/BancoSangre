
using System.Web.Mvc;

namespace BancoSangre.Controllers
{
	public class HomeController : Controller
	{

		[Authorize]
		public ActionResult Menu()
		{
			return View();
		}

		[Authorize]
		public ActionResult Sobre()
		{
			ViewBag.Message = "Banco de sangre";

			return View();
		}

		[Authorize]
		public ActionResult Contacto()
		{
			ViewBag.Message = "Contacto.";

			return View();
		}
	}
}