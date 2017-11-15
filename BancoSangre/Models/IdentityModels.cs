
//using System.Security.Claims;
//using System.Threading.Tasks;
//using Microsoft.AspNet.Identity;
//using Microsoft.AspNet.Identity.EntityFramework;

//namespace BancoSangre.Models
//{
//	// Para agregar datos de perfil del usuario, agregue más propiedades a su clase ApplicationUser. Visite https://go.microsoft.com/fwlink/?LinkID=317594 para obtener más información.
//	public class ApplicationUser : IdentityUser
//	{
//		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
//		{
//			// Tenga en cuenta que el valor de authenticationType debe coincidir con el definido en CookieAuthenticationOptions.AuthenticationType
//			var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
//			// Agregar aquí notificaciones personalizadas de usuario
//			return userIdentity;
//		}
//	}

//	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
//	{
//		public ApplicationDbContext()
//				: base("DefaultConnection", throwIfV1Schema: false)
//		{
//		}

//		public static ApplicationDbContext Create()
//		{
//			return new ApplicationDbContext();
//		}
//	}
//}

using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace BancoSangre.Models
{
	// You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
	public class ApplicationUser : IdentityUser
	{
		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
		{
			// Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
			var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
			// Add custom user claims here
			return userIdentity;
		}
	}

	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
	{
		public ApplicationDbContext()
			: base("SecurityConnection", throwIfV1Schema: false)
		{
		}

		public static ApplicationDbContext Create()
		{
			var dbcontext = new ApplicationDbContext();
			return dbcontext;
		}
	}
}