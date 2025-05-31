/********************************************************************************
*  WEB422 – Assignment 2
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jhonatan Lopez Olguin Student ID: 147028237 Date: 24th May 2025
*
*
********************************************************************************/
let page = 1;
const perPage = 6; 
let searchName = null;

function loadSitesData() {
    console.log("loadSitesData");
    const url = searchName ?
        `https://web422as1-theta.vercel.app/api/sites?page=${page}&perPage=${perPage}&name=${searchName}`:
        `https://web422as1-theta.vercel.app/api/sites?page=${page}&perPage=${perPage}`;

    fetch(url)
    .then(res => {
        console.log(res);
        return res.ok ? res.json() : Promise.reject(res.status);
    })
    .then(data => {
        if(data.length) {
            // Create table rows with the 9 required columns
            const rows = data.map(site => `
                <tr data-id="${site._id}">
                    <td>${site.siteName || "N/A"}</td>
                    <td><img src="${site.image || 'https://placehold.co/100x60?text=No+Image'}" 
                             alt="Site Image" style="max-width: 100px; max-height: 60px;" 
                             onerror="this.src='https://placehold.co/100x60?text=No+Image'"></td>
                    <td>${site.description || "No description available"}</td>
                    <td>
                        <ul>
                            ${site.dates ? site.dates.map(date => `<li>${date.year} (${date.type})</li>`).join('') : '<li>No dates available</li>'}
                        </ul>
                    </td>
                    <td>${site.designated || "N/A"}</td>
                    <td>${site.location ? `${site.location.latitude} | ${site.location.longitude}` : "N/A"}</td>
                    <td>${site.location?.town || "N/A"}</td>
                    <td>${site.provinceOrTerritory?.name || "N/A"}</td>
                    <td>${site.provinceOrTerritory?.region || "N/A"}</td>
                </tr>
            `).join("");
            
            const tbody = document.querySelector('#sitesTable tbody');
            tbody.innerHTML = rows;
            document.getElementById("current-page").textContent = page;
            
            // Add click events to each row
            document.querySelectorAll("#sitesTable tbody tr").forEach(row => {
                row.addEventListener("click", () => {
                    const id = row.getAttribute("data-id");

                    fetch(`https://web422as1-theta.vercel.app/api/sites/${id}`)
                        .then(res => res.ok ? res.json() : Promise.reject(res.status))
                        .then(details => {
                            const detailName = document.querySelector("#detailsModal .modal-title");
                            const modalBody = document.querySelector("#detailsModal .modal-body");

                            detailName.textContent = details.siteName;
                            modalBody.innerHTML = `
                                <img id="photo" 
                                     onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'" 
                                     class="img-fluid w-100" 
                                     src="${details.image || 'https://placehold.co/600x400?text=Photo+Not+Available'}"><br><br>
                                <p><b>Description:</b> ${details.description || "No description available"}</p>
                                <p><b>Dates:</b></p>
                                <ul>
                                    ${details.dates ? details.dates.map(date => `<li>${date.year} (${date.type})</li>`).join('') : '<li>No dates available</li>'}
                                </ul>
                                <p><b>Designated:</b> ${details.designated || "N/A"}</p>
                                <p><b>Location:</b> ${details.location ? `${details.location.latitude}, ${details.location.longitude}` : "N/A"}</p>
                                <p><b>Town:</b> ${details.location?.town || "N/A"}, ${details.provinceOrTerritory?.name || "N/A"}</p>
                                <p><b>Region:</b> ${details.provinceOrTerritory?.region || "N/A"}</p>
                            `;
                            const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
                            modal.show();
                        })
                        .catch(() => {
                            alert("Failed to load site details.");
                        });
                });
            });

        } else {
            const tbody = document.querySelector('#sitesTable tbody');
            if (page > 1) {
                page--;
            } else {
                tbody.innerHTML = `<tr><td colspan="9"><strong>No data available</strong></td></tr>`;
            }
            document.getElementById("current-page").textContent = page;
        }
    }).catch(err => {
        const tbody = document.querySelector("#sitesTable tbody");
        if (page > 1) {
            page--;
        } else {
            tbody.innerHTML = `<tr><td colspan="9"><strong>No data available</strong></td></tr>`;
        }
        document.getElementById("current-page").textContent = page;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadSitesData();

    const previousPageButton = document.querySelector("#previous-page");
    const nextPageButton = document.querySelector("#next-page");
    const clearForm = document.querySelector("#clearForm");

    previousPageButton.addEventListener("click", () => {
        if(page > 1) {
            page--;
            loadSitesData();
        }
    });

    nextPageButton.addEventListener("click", () => {
        page++;
        loadSitesData();
    });

    document.getElementById("searchForm").addEventListener("submit", (e) => {
        e.preventDefault();
        searchName = document.getElementById("name").value;
        page = 1;
        console.log(searchName);
        loadSitesData();
    });

    clearForm.addEventListener("click", () => {
        document.getElementById("name").value = "";
        searchName = null;
        loadSitesData();
    });
});