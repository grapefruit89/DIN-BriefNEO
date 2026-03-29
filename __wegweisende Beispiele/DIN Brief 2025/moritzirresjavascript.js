<script>
    document.addEventListener('DOMContentLoaded', () => {
      const datumElement = document.querySelector('datum');
      const betreffElement = document.querySelector('betreff');
      const titleElement = document.querySelector('title');

      if (datumElement && betreffElement && titleElement) {
        const heute = new Date();
        // Formatiertes Datum für <datum> (z. B. "03. Mai 2025")
        const formatiertesDatum = heute.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).replace(/(\d+)\. (\w+) (\d+)/, '$1. $2 $3');
        datumElement.textContent = formatiertesDatum;

        // ISO-Datum für den Titel (z. B. "2025-05-03")
        const isoDatum = heute.toISOString().split('T')[0];

        // Betreff-Inhalt holen
        const betreffText = betreffElement.textContent;

        // Titel aktualisieren
        titleElement.textContent = `${isoDatum}_${betreffText}`;
      }
    });
  </script>

