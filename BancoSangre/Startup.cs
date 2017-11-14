using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BancoSangre.Startup))]
namespace BancoSangre
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
