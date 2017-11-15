
using System.Collections.Generic;

namespace BancoSangre.Models
{
	public class RolesUsuarios
	{
		public ICollection<AspNetRoles> Roles { get; set; }
		public ICollection<AspNetUsers> Usuarios { get; set; }

		public string RolId { get; set; }
		public string UsuarioId { get; set; }
	}
}