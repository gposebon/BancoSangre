
using System.Collections.Generic;

namespace BancoSangre.Models
{
	public class CuestionarioDonante
	{
		public int IdDonante { get; set; }
		public IList<PreguntaCuestionario> Preguntas { get; set; }
		public IList<DatoDemografico> DatosDemograficos { get; set; }
		public string Fecha { get; set; }
	}

	public class DatoDemografico
	{
		public string Etiqueta { get; set; }
		public string Dato { get; set; }
	}
}