//------------------------------------------------------------------------------
// <auto-generated>
//     Este código se generó a partir de una plantilla.
//
//     Los cambios manuales en este archivo pueden causar un comportamiento inesperado de la aplicación.
//     Los cambios manuales en este archivo se sobrescribirán si se regenera el código.
// </auto-generated>
//------------------------------------------------------------------------------

namespace BancoSangre.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Cuestionario
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Cuestionario()
        {
            this.PreguntaCuestionario = new HashSet<PreguntaCuestionario>();
            this.DatoDemograficoCuestionario = new HashSet<DatoDemograficoCuestionario>();
        }
    
        public System.Guid IdCuestionario { get; set; }
        public int IdDonante { get; set; }
        public System.DateTime Fecha { get; set; }
    
        public virtual Donante Donante { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PreguntaCuestionario> PreguntaCuestionario { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DatoDemograficoCuestionario> DatoDemograficoCuestionario { get; set; }
    }
}
