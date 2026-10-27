import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getDatabase, ref, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyCqzTlFw3K4IyNEMGQ0MM6aDi5fxP5beo0",
  authDomain: "report-u8fails.firebaseapp.com",
  databaseURL: "https://report-u8fails-default-rtdb.firebaseio.com",
  projectId: "report-u8fails",
  storageBucket: "report-u8fails.firebasestorage.app",
  messagingSenderId: "752725258869",
  appId: "1:752725258869:web:58889f32a30dcaf13c3e3c"
    
 };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let head = document.getElementById('header');
let format_date = new Date().toLocaleDateString('en-EN');

const circle_1 = document.getElementById('bar_pr1');
const text_1 = document.getElementById('text_pr1');

const circle_2 = document.getElementById('bar_f1');
const text_2 = document.getElementById('text_f1');

const circle_3 = document.getElementById('bar_sf1');
const text_3 = document.getElementById('text_sf1');

const circle_4 = document.getElementById('bar_sf2');
const text_4 = document.getElementById('text_sf2');


function setProgress(percent, circle, text, max) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius; // ~440px
    const offset = circumference - (percent / max) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    text.textContent = `${percent}/${max}`;
}


function getData() {

    const datosFail = ref(db, 'failsV2');

    onValue(datosFail, (snapshot) => {

        // 1. Obtener la fecha actual en formato YYYY-MM-DD
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const dia = String(hoy.getDate()).padStart(2, '0');
        const hour = String(hoy.getHours());
        const fechaHoy = `${año}-${mes}-${dia}`; // Ejemplo: "2026-09-23"
    
        var count_fails_pr1 = 0;
        var count_fails_f1 = 0;
        var  count_fails_sf1 = 0;
        var count_fails_sf2 = 0;

        
        const shift_1_inicio = 6;
        const shift_1_fin = 14;
        const shift_2_inicio = 14;
        const shift_2_fin = 22;
        var start = 0;
        var end = 0;


        let html = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Equipo</th>
                        <th>Serial PLX</th>
                        <th>Serial QR</th>
                        <th>Modo de falla</th>
                    </tr>
                </thead>
            <tbody>
        `;

        snapshot.forEach(element => {
        
            const data = element.val();

            if(hour >= shift_1_inicio && hour<=shift_1_fin){
                start = shift_1_inicio;
                end = shift_1_fin;
            }

            if(hour >= shift_2_inicio && hour <= shift_2_fin){
                start = shift_2_inicio;
                end = shift_2_fin;
            }
            
            
            if(data.date && data.date.startsWith(fechaHoy)){
                console.log("Hour "+hour);
                head.textContent = "Fallas funcionales [" + start + " - " + end + "] -:- " + fechaHoy;

                if(data.date.split(' ')[1].split(':')[0]>=start && data.date.split(' ')[1].split(':')[0]<=end){
                    
                    if (data.station?.includes('BLTW1') || data.station?.includes('BLTW4') || data.station?.includes('BLTW5') || data.station?.includes('BLTW6')){
                        count_fails_pr1 += 1;
                    }

                    if (data.station?.includes('ATE21') || data.station?.includes('ATE22') || data.station?.includes('ATE23') || data.station?.includes('ATE25') || data.station?.includes('ATE26') || data.station?.includes('ATE27') || data.station?.includes('ATE41') || data.station?.includes('ATE42') || data.station?.includes('ATE43')){
                        count_fails_f1 += 1;
                    }

                    if (data.station.includes('ACCEL1') || data.station.includes('ACCEL3')){
                        count_fails_sf1 += 1;
                    }

                    if (data.station.includes('ATE33') || data.station.includes('ATE31') || data.station.includes('ATE34')){
                        count_fails_sf2 += 1;
                    }

                    html += `
                        <tr>
                            <td>${data.date || 'N/A'}</td>
                            <td>${data.station || 'N/A'}</td>
                            <td>${data.plx_serial || 'N/A'}</td>
                            <td>${data.qr_serial || 'N/A'}</td>
                            <td>${data.failure_mode || 'N/A'}</td>
                        </tr>
                    `;
                }
            }
            console.log(count_fails_pr1);

            setProgress(count_fails_pr1, circle_1, text_1,15);
            setProgress(count_fails_f1, circle_2, text_2,15);
            setProgress(count_fails_sf1, circle_3, text_3,15);
            setProgress(count_fails_sf2, circle_4, text_4,15);

            document.getElementById('tabla-container').innerHTML = html;
        });
    });
}

getData();