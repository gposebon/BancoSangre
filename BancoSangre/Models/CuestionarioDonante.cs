
using System.Collections.Generic;

namespace BancoSangre.Models
{
	public class CuestionarioDonante
	{
		public IList<PreguntaCuestionario> Preguntas { get; set; }
		public int IdDonante { get; set; }
		public string NombreDonante { get; set; }
		public string Fecha { get; set; }
	}
}