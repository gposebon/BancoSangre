//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace BancoSangre.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Donante
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Donante()
        {
            this.Cuestionario = new HashSet<Cuestionario>();
            this.Donacion = new HashSet<Donacion>();
        }
    
        public long IdDonante { get; set; }
        public int IdTipoDoc { get; set; }
        public int NroDoc { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public string Domicilio { get; set; }
        public int IdProvincia { get; set; }
        public int IdLocalidad { get; set; }
        public string Telefono { get; set; }
        public string Ocupacion { get; set; }
        public Nullable<System.DateTime> FechaNacimiento { get; set; }
        public int IdGrupoFactor { get; set; }
        public int IdEstadoDonante { get; set; }
        public System.DateTime Fecha { get; set; }
        public Nullable<System.DateTime> DiferidoHasta { get; set; }
        public string LugarNacimiento { get; set; }
        public string CausasIngresadasRechazoDiferido { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Cuestionario> Cuestionario { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Donacion> Donacion { get; set; }
        public virtual GrupoFactor GrupoFactor { get; set; }
        public virtual Localidad Localidad { get; set; }
        public virtual Provincia Provincia { get; set; }
        public virtual TipoDocumento TipoDocumento { get; set; }
        public virtual EstadoDonante EstadoDonante { get; set; }
    }
}
