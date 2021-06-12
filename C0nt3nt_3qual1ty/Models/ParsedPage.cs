namespace C0nt3nt_3qual1ty.Models
{
    public class ParsedPage
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Text { get; set; }
        public string Html { get; set; }
        public int Uniqueness { get; set; }
        public bool Edited { get; set; } = false;
        public bool Linked { get; set; } = false;
        public bool Translated { get; set; } = false;
        public bool Done { get; set; } = false;
    }
}