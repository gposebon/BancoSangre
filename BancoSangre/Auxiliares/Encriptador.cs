using System;
using System.IO;
using System.Security.Cryptography;

namespace BancoSangre.Auxiliares
{
	public class Encriptador
	{
		public string Desencriptar(string texto)
		{
			if (string.IsNullOrEmpty(texto)) return null;

			var bytesCifrados = Convert.FromBase64String(texto);
			var pdb = new Rfc2898DeriveBytes(Contrasena, Salt);
			var datoDesencriptado = Desencriptar(bytesCifrados, pdb.GetBytes(32), pdb.GetBytes(16));
			return System.Text.Encoding.Unicode.GetString(datoDesencriptado);
		}

		private static byte[] Desencriptar(byte[] datoCifrado, byte[] clave, byte[] iv)
		{
			var ms = new MemoryStream();
			CryptoStream cs = null;
			try
			{
				var alg = Rijndael.Create();
				alg.Key = clave;
				alg.IV = iv;
				cs = new CryptoStream(ms, alg.CreateDecryptor(), CryptoStreamMode.Write);
				cs.Write(datoCifrado, 0, datoCifrado.Length);
				cs.FlushFinalBlock();
				return ms.ToArray();
			}
			catch
			{
				return null;
			}
			finally
			{
				if (cs != null) cs.Close();
			}
		}

		public string Encriptar(string texto)
		{
			if (string.IsNullOrEmpty(texto)) return null;

			var bytesLimpios = System.Text.Encoding.Unicode.GetBytes(texto);
			var pdb = new Rfc2898DeriveBytes(Contrasena, Salt);
			var datoEncriptado = Encriptar(bytesLimpios, pdb.GetBytes(32), pdb.GetBytes(16));
			return Convert.ToBase64String(datoEncriptado);
		}

		private static byte[] Encriptar(byte[] datoLimpio, byte[] clave, byte[] iv)
		{
			var ms = new MemoryStream();
			CryptoStream cs = null;
			try
			{
				var alg = Rijndael.Create();
				alg.Key = clave;
				alg.IV = iv;
				cs = new CryptoStream(ms, alg.CreateEncryptor(), CryptoStreamMode.Write);
				cs.Write(datoLimpio, 0, datoLimpio.Length);
				cs.FlushFinalBlock();
				return ms.ToArray();
			}
			catch
			{
				return null;
			}
			finally
			{
				if (cs != null) cs.Close();
			}
		}

		private const string Contrasena = "hom6r3NU3V0%";
		private static readonly byte[] Salt = { 0x45, 0xF1, 0x61, 0x6e, 0x20, 0x00, 0x65, 0x64, 0x76, 0x65, 0x64, 0x03, 0x76 };
	}

}