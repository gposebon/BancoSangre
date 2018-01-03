
using System.Collections.Generic;

namespace BancoSangre.Models
{
	public class CuestionarioDonante
	{
		public int IdDonante { get; set; }
		public IList<PreguntaCuestionario> Preguntas { get; set; }
		public IList<DatoDemograficoCuestionario> DatosDemograficos { get; set; }
		public string Fecha { get; set; }
	}
	
}