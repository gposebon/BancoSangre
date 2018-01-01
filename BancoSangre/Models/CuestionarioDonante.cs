
using System.Collections.Generic;

namespace BancoSangre.Models
{
	public class CuestionarioDonante
	{
		public IList<PreguntaCuestionario> Preguntas { get; set; }
		public Donante Donante { get; set; }
		public string Fecha { get; set; }
	}
}