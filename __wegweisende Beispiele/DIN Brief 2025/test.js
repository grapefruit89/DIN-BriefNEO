document.addEventListener('DOMContentLoaded', () => {
    const salutations = [
        { text: "Sehr geehrte Damen und Herren", formality: "formal", requiresName: false },
        { text: "Sehr geehrter Herr", formality: "formal", requiresName: true },
        { text: "Sehr geehrte Frau", formality: "formal", requiresName: true },
        { text: "Guten Tag, Herr", formality: "semi-formal", requiresName: true },
        { text: "Guten Tag, Frau", formality: "semi-formal", requiresName: true },
        { text: "Sehr geehrter Herr Dr.", formality: "formal", requiresName: true },
        { text: "Sehr geehrte Frau Dr.", formality: "formal", requiresName: true },
        { text: "Sehr geehrter Herr Professor", formality: "formal", requiresName: true },
        { text: "Sehr geehrte Frau Professor", formality: "formal", requiresName: true },
        { text: "Lieber Herr", formality: "informal", requiresName: true }
    ];

    const closings = {
        "formal": ["Mit freundlichen Grüßen,", "Hochachtungsvoll,", "Mit vorzüglicher Hochachtung,"],
        "semi-formal": ["Freundliche Grüße,", "Mit besten Grüßen,"],
        "informal": ["Viele Grüße,", "Herzliche Grüße,", "Liebe Grüße,"]
    };

    const salutationSelect = document.getElementById("salutation");
    const nameInput = document.getElementById("name");
    const closingSelect = document.getElementById("closing");
    const anredeElement = document.querySelector('anrede');
    const grussformelElement = document.querySelector('grussformel');

    console.log('salutationSelect:', salutationSelect);
    console.log('closingSelect:', closingSelect);
    console.log('anredeElement:', anredeElement);
    console.log('grussformelElement:', grussformelElement);

    if (!salutationSelect || !closingSelect || !anredeElement || !grussformelElement) {
        console.error('Ein oder mehrere Elemente wurden nicht gefunden.');
        return;
    }

    salutations.forEach((sal, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.text = sal.text;
        salutationSelect.add(option);
    });

    salutationSelect.value = 0;
    const defaultSal = salutations[0];
    if (defaultSal.requiresName) {
        nameInput.style.display = 'block';
    } else {
        nameInput.style.display = 'none';
    }
    updateClosings(defaultSal.formality);
    updateLetter();

    salutationSelect.addEventListener("change", () => {
        const selectedIndex = parseInt(salutationSelect.value);
        const selectedSal = salutations[selectedIndex];
        if (selectedSal.requiresName) {
            nameInput.style.display = 'block';
        } else {
            nameInput.style.display = 'none';
            nameInput.value = "";
        }
        updateClosings(selectedSal.formality);
        updateLetter();
    });

    nameInput.addEventListener("input", updateLetter);
    closingSelect.addEventListener("change", updateLetter);

    function updateClosings(formality) {
        closingSelect.innerHTML = "";
        const closingList = closings[formality] || closings["formal"];
        closingList.forEach(clos => {
            const option = document.createElement("option");
            option.value = clos;
            option.text = clos;
            closingSelect.add(option);
        });
    }

    function updateLetter() {
        const selectedIndex = parseInt(salutationSelect.value);
        const selectedSal = salutations[selectedIndex];
        let fullSalutation = selectedSal.text;
        if (selectedSal.requiresName) {
            fullSalutation += " " + nameInput.value;
        }
        fullSalutation += ",";
        anredeElement.textContent = fullSalutation;
        grussformelElement.textContent = closingSelect.value;
        console.log('Aktualisiert: anrede ->', fullSalutation);
        console.log('Aktualisiert: grussformel ->', closingSelect.value);
    }
});

