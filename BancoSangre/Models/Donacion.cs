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
    
    public partial class Donacion
    {
        public string NroRegistro { get; set; }
        public int IdDonante { get; set; }
        public int IdDestino { get; set; }
        public string Material { get; set; }
        public string Cantidad { get; set; }
        public System.DateTime Fecha { get; set; }
        public string Peso { get; set; }
    
        public virtual DestinoDonacion DestinoDonacion { get; set; }
        public virtual Donante Donante { get; set; }
    }
}
