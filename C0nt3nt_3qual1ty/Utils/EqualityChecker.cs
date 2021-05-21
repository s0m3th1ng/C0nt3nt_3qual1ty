using System;
using Newtonsoft.Json.Linq;

namespace C0nt3nt_3qual1ty.Utils
{
    public class EqualityChecker
    {
        private const string HttpRequestError = "Error connecting the equality checker server";
        private readonly string _apiKey = Config.Get("ApiKeys:EqualityKey");
        private readonly string _addUrl = Config.Get("Urls:EqualityAddUrl");
        private readonly string _checkStateUrl = Config.Get("Urls:EqualityCheckStateUrl");

        public int GetEquality(string text, ApisRequestsHandler requestsHandler)
        {
            string addingResponse = AddText(text, requestsHandler);
            string checkingKey = GetCheckingKey(addingResponse);
            int equality = CheckCompleted(checkingKey, requestsHandler);

            return equality;
        }

        private string AddText(string text, ApisRequestsHandler requestsHandler)
        {
            var content = new
            {
                id = 1,
                jsonrpc = "2.0",
                method = "unique_text_add",
                @params = new
                {
                    token = _apiKey,
                    text = text,
                }
            };
            string result = requestsHandler.PostRequestResponse(_addUrl, content).Result;
            if (result == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }
            return result;
        }

        private string GetCheckingKey(string addingResponse)
        {
            if (addingResponse == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }

            JToken addingResult = JObject.Parse(addingResponse)["result"];
            if (addingResult["error"] != null)
            {
                throw new NullReferenceException((string) addingResult["error_msg"]);
            }

            return (string) addingResult["key"];
        }

        private int CheckCompleted(string checkingKey, ApisRequestsHandler requestsHandler)
        {
            string status = null;
            string result = null;
            var content = new
            {
                id = 1,
                jsonrpc = "2.0",
                method = "unique_check",
                @params = new
                {
                    token = _apiKey,
                    key = checkingKey,
                    get_text = 0,
                    report_json = 1
                },
            };
            
            while (!Equals(status, "done"))
            {
                result = requestsHandler.PostRequestResponse(_checkStateUrl, content).Result;
                if (result != null)
                {
                    status = (string) JObject.Parse(result)["result"]["status"];
                }
                System.Threading.Thread.Sleep(20);
            }
            int equality = (int) JObject.Parse(result)["result"]["report"]["equality"];
            return equality;
        }
    }
}