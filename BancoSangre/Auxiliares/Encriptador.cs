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

			var cipherBytes = Convert.FromBase64String(texto);
			var pdb = new Rfc2898DeriveBytes(Pwd, Salt);
			var decryptedData = Desencriptar(cipherBytes, pdb.GetBytes(32), pdb.GetBytes(16));
			return System.Text.Encoding.Unicode.GetString(decryptedData);
		}

		private static byte[] Desencriptar(byte[] cipherData, byte[] key, byte[] iv)
		{
			var ms = new MemoryStream();
			CryptoStream cs = null;
			try
			{
				var alg = Rijndael.Create();
				alg.Key = key;
				alg.IV = iv;
				cs = new CryptoStream(ms, alg.CreateDecryptor(), CryptoStreamMode.Write);
				cs.Write(cipherData, 0, cipherData.Length);
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

			var clearBytes = System.Text.Encoding.Unicode.GetBytes(texto);
			var pdb = new Rfc2898DeriveBytes(Pwd, Salt);
			var encryptedData = Encriptar(clearBytes, pdb.GetBytes(32), pdb.GetBytes(16));
			return Convert.ToBase64String(encryptedData);
		}

		private static byte[] Encriptar(byte[] clearData, byte[] key, byte[] iv)
		{
			var ms = new MemoryStream();
			CryptoStream cs = null;
			try
			{
				var alg = Rijndael.Create();
				alg.Key = key;
				alg.IV = iv;
				cs = new CryptoStream(ms, alg.CreateEncryptor(), CryptoStreamMode.Write);
				cs.Write(clearData, 0, clearData.Length);
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

		private const string Pwd = "hom6r3NU3V0%";
		private static readonly byte[] Salt = { 0x45, 0xF1, 0x61, 0x6e, 0x20, 0x00, 0x65, 0x64, 0x76, 0x65, 0x64, 0x03, 0x76 };
	}

}