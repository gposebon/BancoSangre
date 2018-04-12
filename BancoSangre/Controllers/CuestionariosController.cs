using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using BancoSangre.Auxiliares;
using BancoSangre.Models;

namespace BancoSangre.Controllers
{
	public class CuestionariosController : Controller
	{
		private readonly bancosangreEntities _db;

		public CuestionariosController()
		{
			_db = new bancosangreEntities();
			_db.Configuration.ProxyCreationEnabled = false;
		}

		#region Api

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionarioParaDonante(int idDonante)
		{
			var preguntasCuestionarioActual = _db.Pregunta.Where(x => x.Mostrar).OrderBy(x => x.Orden).ToList();
			var preguntas = preguntasCuestionarioActual.Select(x => new PreguntaCuestionario
			{
				IdPregunta = x.IdPregunta,
				TextoPregunta = x.TextoPregunta,
				Orden = x.Orden,
				CausalRechazo = x.CausalRechazo,
				EsCerrada = x.EsCerrada,
				EsTitulo = x.EsTitulo,
				LineaCompleta = x.LineaCompleta,
				NuevaLinea = x.NuevaLinea,
				RespuestaCerrada = null,
				RespuestaAbierta = ""
			}).ToList();

			var donante = idDonante != -1 
				? _db.Donante.Include(x => x.Localidad).Include(x => x.Provincia).Include(x => x.GrupoFactor).SingleOrDefault(x => x.IdDonante == idDonante)
				: null;

			var cuestionarioDonante = new CuestionarioDonante
			{
				DatosDemograficos = ObtenerDatosDemograficos(donante),
				Preguntas = preguntas,
				Fecha = DateTime.Now.ToString("dd/MM/yyyy")
			};

			var json = new
			{
				data = cuestionarioDonante
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		private static IList<DatoDemograficoCuestionario> ObtenerDatosDemograficos(Donante donante)
		{
			var edad = "";
			if (donante != null && donante.FechaNacimiento != null)
			{
				var tiempoInicial = new DateTime(1, 1, 1);
				var dif = DateTime.Now - (DateTime)donante.FechaNacimiento;
				edad = ((tiempoInicial + dif).Year - 1).ToString();
			}

			return new[] {
				new DatoDemograficoCuestionario { Etiqueta = "Apellido y nombre:", Dato = donante != null ? donante.Apellido + ", " + donante.Nombre : "", Orden = 1},
				new DatoDemograficoCuestionario { Etiqueta = "Edad:", Dato = edad, Orden = 2 },
				new DatoDemograficoCuestionario { Etiqueta = "Domicilio:", Dato = donante != null ? donante.Domicilio : "", Orden = 3 },
				new DatoDemograficoCuestionario { Etiqueta = "Fecha:", Dato = donante != null ? DateTime.Now.ToString("dd/MM/yyyy") : "", Orden = 4 },
				new DatoDemograficoCuestionario { Etiqueta = "Localidad:", Dato = donante != null ? donante.Localidad.NombreLocalidad + " (" + donante.Provincia.NombreProvincia + ")" : "", Orden = 4 },
				new DatoDemograficoCuestionario { Etiqueta = "DNI:", Dato = donante != null ? donante.TipoDocumento + " " + donante.NroDoc : "", Orden = 5 },
				new DatoDemograficoCuestionario { Etiqueta = "Teléfono:", Dato = donante != null ? donante.Telefono : "", Orden = 6 },
				new DatoDemograficoCuestionario { Etiqueta = "Fecha nacimiento:", Dato = donante != null
					? (donante.FechaNacimiento.HasValue ? ((DateTime)donante.FechaNacimiento).ToString("dd/MM/yyyy") : "")
					: "", Orden = 7 },
				new DatoDemograficoCuestionario { Etiqueta = "Ocupación:", Dato = donante != null ? donante.Ocupacion : "", Orden = 8 },
				new DatoDemograficoCuestionario { Etiqueta = "Lugar nacimiento:", Dato = donante != null ? donante.LugarNacimiento : "", Orden = 9 },
				new DatoDemograficoCuestionario { Etiqueta = "Grupo RH:", Dato = donante != null ? donante.GrupoFactor.DescripcionGrupoFactor : "", Orden = 10 },
				new DatoDemograficoCuestionario { Etiqueta = "Código postal:", Dato = donante != null ? donante.Localidad.CodigoPostal.ToString() : "", Orden = 11 },
			};
		}

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionarioPorId(Guid idCuestionario)
		{
			var cuestionario = _db.Cuestionario.Include(x => x.Donante).Include(x => x.Donante.Localidad).Include(x => x.Donante.Provincia).Include(x => x.Donante.GrupoFactor)
				.Include(x => x.PreguntaCuestionario).Include(x => x.DatoDemograficoCuestionario).SingleOrDefault(x => x.IdCuestionario == idCuestionario);

			if (cuestionario == null)
				return Json(null, JsonRequestBehavior.AllowGet);

			var encriptador = new Encriptador();

			var cuestionarioDonante = new CuestionarioDonante
			{
				DatosDemograficos = cuestionario.DatoDemograficoCuestionario.OrderBy(x => x.Orden).Select(x => new DatoDemograficoCuestionario
				{
					Etiqueta = x.Etiqueta,
					Dato = x.Dato
				}).ToList(),
				Preguntas = cuestionario.PreguntaCuestionario.OrderBy(x => x.Orden).Select(x => new PreguntaCuestionario
				{
					IdPregunta = x.IdPregunta,
					TextoPregunta = x.TextoPregunta,
					Orden = x.Orden,
					CausalRechazo = x.CausalRechazo,
					EsCerrada = x.EsCerrada,
					EsTitulo = x.EsTitulo,
					LineaCompleta = x.LineaCompleta,
					NuevaLinea = x.NuevaLinea,
					RespuestaCerrada = encriptador.Desencriptar(x.RespuestaCerrada),
					RespuestaAbierta = encriptador.Desencriptar(x.RespuestaAbierta)
		}).ToList(),
				Fecha = cuestionario.Fecha.ToString("dd/MM/yyyy")
			};

			var json = new
			{
				data = cuestionarioDonante
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpGet]
		[Authorize]
		public ActionResult ObtenerCuestionariosDeDonante(int idDonante)
		{
			var cuestionarios = _db.Cuestionario.Where(x => x.IdDonante == idDonante).OrderByDescending(x => x.Fecha).Include(x => x.Donante).ToList();

			if (!cuestionarios.Any())
				return Json(null, JsonRequestBehavior.AllowGet);

			var resultado = new
			{
				Donante = new { cuestionarios[0].Donante.IdDonante, cuestionarios[0].Donante.Apellido, cuestionarios[0].Donante.Nombre },
				Cuestionarios = cuestionarios.Select(x => new { x.IdCuestionario, Fecha = x.Fecha.ToString("dd/MM/yyyy") })
			};

			var json = new
			{
				cantidad = cuestionarios.Count,
				data = resultado
			};

			return Json(json, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		[Authorize]
		public ActionResult GuardarCuestionarioParaDonante(CuestionarioDonante cuestionarioDonante)
		{
			try
			{
				var idDonante = cuestionarioDonante.IdDonante;

				var nuevoCuestionario = new Cuestionario
				{
					IdCuestionario = Guid.NewGuid(),
					IdDonante = cuestionarioDonante.IdDonante,
					Fecha = DateTime.Now
				};

				var ultimoCuestionario = _db.Cuestionario.Add(nuevoCuestionario);
				_db.SaveChanges();

				var encriptador = new Encriptador();
				if (ultimoCuestionario != null)
				{
                    // Si al menos una pregunta "causal de rechazo" fue respondida afirmativamente, el estado del donante pasa a Rechazado.
                    if (cuestionarioDonante.Preguntas.Any(x => x.CausalRechazo && x.RespuestaCerrada == "True"))
                    {
                        var donante = _db.Donante.Find(idDonante);
                        if (donante != null)
                        {
                            donante.IdEstadoDonante = 2;
                            _db.SaveChanges();
                        }
                    }
                    // Guarda datos demográficos.
                    foreach (var datoDemografico in cuestionarioDonante.DatosDemograficos)
                    {
                        datoDemografico.IdDatoDemograficoCuestionario = Guid.NewGuid();
                        datoDemografico.IdCuestionario = ultimoCuestionario.IdCuestionario;
                        _db.DatoDemograficoCuestionario.Add(datoDemografico);
                    }
                    // Guarda preguntas y respuestas.
                    foreach (var pregunta in cuestionarioDonante.Preguntas)
					{
						pregunta.IdPreguntaCuestionario = Guid.NewGuid();
						pregunta.IdCuestionario = ultimoCuestionario.IdCuestionario;
						pregunta.RespuestaCerrada = encriptador.Encriptar(pregunta.RespuestaCerrada);
						pregunta.RespuestaAbierta = encriptador.Encriptar(pregunta.RespuestaAbierta);
						_db.PreguntaCuestionario.Add(pregunta);
					}

					_db.SaveChanges();
				}

				return Json(true, JsonRequestBehavior.AllowGet);
			}
			catch (Exception)
			{
				return Json(false, JsonRequestBehavior.AllowGet);
			}
		}

		#endregion

		// GET: Cuestionarios
		[Authorize]
		public ActionResult CuestionariosExistentes(int idDonante)
		{
			return View();
		}

		[Authorize]
		public ActionResult Cuestionario(int idDonante)
		{
			return View();
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing)
			{
				_db.Dispose();
			}
			base.Dispose(disposing);
		}
	}
}
