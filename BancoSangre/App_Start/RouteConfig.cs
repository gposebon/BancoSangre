using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace BancoSangre
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

             routes.MapRoute(
                name: "Donantes",
                url: "Donantes/TraerLocalidades/{IdProvincia}",
                defaults: new { controller = "Donantes", action = "TraerLocalidades", IdProvincia = 0 }
             ); 

           

             routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Account", action = "Login", id = UrlParameter.Optional }
            );

        }
    }
}
