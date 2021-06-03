using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace C0nt3nt_3qual1ty.Utils
{
    public class ApisRequestsHandler
    {
        private static readonly HttpClient Client = new();

        public async Task<string> GetRequestResponse(string url)
        {
            string response = null;
            try
            {
                HttpResponseMessage responseMessage = await Client.GetAsync(url);
                responseMessage.EnsureSuccessStatusCode();
                response = await responseMessage.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException)
            { }
            
            return response;
        }

        public async Task<string> PostRequestResponse(string url, object data)
        {
            string response = null;
            try
            {
                var content = new StringContent(JsonConvert.SerializeObject(data));
                HttpResponseMessage responseMessage = await Client.PostAsync(url, content);
                responseMessage.EnsureSuccessStatusCode();
                byte[] byteResponse = await responseMessage.Content.ReadAsByteArrayAsync();
                response = Encoding.UTF8.GetString(byteResponse);
            }
            catch (HttpRequestException)
            { }
            
            return response;
        }
        
        public async Task<string> PostFileRequestResponse(string url, MultipartContent content)
        {
            string response = null;
            try
            {
                HttpResponseMessage responseMessage = await Client.PostAsync(url, content);
                responseMessage.EnsureSuccessStatusCode();
                byte[] byteResponse = await responseMessage.Content.ReadAsByteArrayAsync();
                response = Encoding.UTF8.GetString(byteResponse);
            }
            catch (HttpRequestException)
            { }
            
            return response;
        }
    }
}