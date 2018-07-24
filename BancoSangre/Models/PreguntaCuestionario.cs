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
    
    public partial class PreguntaCuestionario
    {
        public System.Guid IdPreguntaCuestionario { get; set; }
        public System.Guid IdCuestionario { get; set; }
        public int IdPregunta { get; set; }
        public string RespuestaCerrada { get; set; }
        public string RespuestaAbierta { get; set; }
        public Nullable<int> Orden { get; set; }
        public bool EsCerrada { get; set; }
        public bool CausalRechazo { get; set; }
        public string TextoPregunta { get; set; }
        public bool EsTitulo { get; set; }
        public bool LineaCompleta { get; set; }
        public bool NuevaLinea { get; set; }
        public Nullable<bool> LineaHorizontal { get; set; }
    
        public virtual Cuestionario Cuestionario { get; set; }
        public virtual Pregunta Pregunta { get; set; }
    }
}
