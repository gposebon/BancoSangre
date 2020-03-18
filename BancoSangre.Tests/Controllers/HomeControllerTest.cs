
using System.Web.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using BancoSangre.Controllers;

namespace BancoSangre.Tests.Controllers
{
    [TestClass]
    public class HomeControllerTest
    {
        [TestMethod]
        public void Menu()
        {
            // Arrange
            HomeController controller = new HomeController();

            // Act
            ViewResult result = controller.Menu() as ViewResult;

            // Assert
            Assert.IsNotNull(result);
        }

        [TestMethod]
        public void Sobre()
        {
            // Arrange
            HomeController controller = new HomeController();

            // Act
            ViewResult result = controller.Sobre() as ViewResult;

            // Assert
            Assert.AreEqual("Your application description page.", result.ViewBag.Message);
        }

        [TestMethod]
        public void Contacto()
        {
            // Arrange
            HomeController controller = new HomeController();

            // Act
            ViewResult result = controller.Contacto() as ViewResult;

            // Assert
            Assert.IsNotNull(result);
        }
    }
}
