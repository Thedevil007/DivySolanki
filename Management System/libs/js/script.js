$(document).ready(function () {

  /*----------------------------------------*/
  /* Global variables */
  /*----------------------------------------*/

   // Preloader
  function hidePreloader() {
    $("#preloader").fadeOut(500, function() {
      $(this).remove();
    });
    $("#mainContent").fadeIn(500);
  }

  // Call functions to populate personnel tables on load
  getAllPersonnel();

  // Clear search input on load
  clearSearchInput();

  // Update filter button state on load
  updateFilterButtonState();

  // Reset filter dropdowns on load
  resetFilterDropdowns();

  // Hide preloader after everything is initialized
  setTimeout(hidePreloader, 800);

  // Clear Table  
  const clearTable = (tableType) => {

    if (tableType === "personnel") {
      $("#personnelTableBody").html(""); 
    }

    if (tableType === "departments") {
      $("#departmentTableBody").html("");
    }

    if (tableType === "locations") {
      $("#locationTableBody").html("");
    }

  };

  // <td> Classes
  const tdClass = "align-middle text-nowrap d-none d-md-table-cell";
  const btnClass = "btn btn-primary btn-sm";
  
  // <button> Classes
  function createButtonElement(id, buttonType, tableType = "Personnel") {
    // Set icon class based on button type
    const iconClass = buttonType === "edit" ? "fa-pencil" : "fa-trash";
    const modalTarget = `#${buttonType}${tableType}Modal`;

    // Create button element
    const button = document.createElement("button");
    button.type = "button";
    button.className = btnClass + " me-2";
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-bs-target", modalTarget);
    button.setAttribute("data-id", id);

    // Create icon element
    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconClass}`;

    // Append icon to button
    button.appendChild(icon);

    return button;

  };

  // Function to Show Success Toast
  function showSuccessToast(message) {

    $("#successToastMessage").text(message);

    const toast = new bootstrap.Toast($("#successToast")[0]);
    toast.show();

  };

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/

  // Get All Personnel
  function getAllPersonnel() {
    $.ajax({
      url: "libs/php/getAllPersonnel.php",
      type: "GET",
      dataType: "json",
      success: function(result) {
        if (result.status.code == 200) {
          // Clear the table before appending new data
          clearTable("personnel");

          // Create a document fragment to improve performance
          const frag = document.createDocumentFragment();

          result.data.forEach(function(personnel) {
            // Create a row with data attributes for filtering
            const row = document.createElement("tr");
            row.setAttribute("data-department-name", personnel.department);
            row.setAttribute("data-location-name", personnel.location);

            // Name cell
            const nameCell = document.createElement("td");
            nameCell.className = "align-middle text-nowrap";
            nameCell.textContent = `${personnel.lastName}, ${personnel.firstName}`;
            row.appendChild(nameCell);

            // Department cell
            const deptCell = document.createElement("td");
            deptCell.className = tdClass;
            deptCell.textContent = personnel.department;
            row.appendChild(deptCell);

            // Location cell
            const locCell = document.createElement("td");
            locCell.className = tdClass;
            locCell.textContent = personnel.location;
            row.appendChild(locCell);

            // Email cell
            const emailCell = document.createElement("td");
            emailCell.className = tdClass;
            emailCell.textContent = personnel.email;
            row.appendChild(emailCell);

            // Action cell
            const actionCell = document.createElement("td");
            actionCell.className = "text-end pe-0";
            actionCell.appendChild(createButtonElement(personnel.id, "edit"));
            actionCell.appendChild(createButtonElement(personnel.id, "delete"));
            row.appendChild(actionCell);

            // Add row to fragment
            frag.appendChild(row);

          });

          // Append the fragment to the table body
          document.getElementById("personnelTableBody").appendChild(frag);
        }
      }
    });
  };

  // Get All Departments
  function getAllDepartments () {
    // AJAX call to get all departments
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",

      success: function (result) {

        if (result.status.code == 200) {
          // Clear the table before appending new data
          clearTable("departments");
        
          // Create a document fragment to improve performance
          const frag = document.createDocumentFragment();
          
          result.data.forEach(function(department) {
            // Create a row
            const row = document.createElement("tr");
            
            // Department name cell
            const nameCell = document.createElement("td");
            nameCell.className = "align-middle text-nowrap";
            nameCell.textContent = department.name;
            row.appendChild(nameCell);
            
            // Location cell
            const locationCell = document.createElement("td");
            locationCell.className = tdClass;
            locationCell.textContent = department.location;
            row.appendChild(locationCell);
            
            // Action cell
            const actionCell = document.createElement("td");
            actionCell.className = "text-end pe-0";
            actionCell.appendChild(createButtonElement(department.id, "edit", "Departments"));
            actionCell.appendChild(createButtonElement(department.id, "delete", "Departments"));
            row.appendChild(actionCell);
            
            // Add row to fragment
            frag.appendChild(row);
          });

          // Append the fragment to the table body
          document.getElementById("departmentTableBody").appendChild(frag);
        }
      }
    });
  };

  // Get All Locations
  function getAllLocations () {
    // AJAX call to get all locations
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {        
          // Clear the table before appending new data
          clearTable("locations");

          // Create a document fragment to improve performance
          const frag = document.createDocumentFragment();
          
          result.data.forEach(function(location) {
            // Create a row
            const row = document.createElement("tr");
            
            // Location name cell
            const nameCell = document.createElement("td");
            nameCell.className = "align-middle text-nowrap";
            nameCell.textContent = location.name;
            row.appendChild(nameCell);
            
            // Action cell
            const actionCell = document.createElement("td");
            actionCell.className = "text-end pe-0";
            actionCell.appendChild(createButtonElement(location.id, "edit", "Locations"));
            actionCell.appendChild(createButtonElement(location.id, "delete", "Locations"));
            row.appendChild(actionCell);
            
            // Add row to fragment
            frag.appendChild(row);
          });

          // Append the fragment to the table body
          document.getElementById("locationTableBody").appendChild(frag);
        }
      }
    });
  };

  /*----------------------------------------*/
  /* DELETE FUNCTIONS */
  /*----------------------------------------*/

  // Delete Personnel Modal Show
  $("#deletePersonnelModal").on("show.bs.modal", function (e) {
    // Get the personnel ID from the button that triggered the modal
    const personnelId = $(e.relatedTarget).attr("data-id");

    // Set the hidden input value 
    $("#deletePersonnelID").val(personnelId);

    // Get personnel name
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: personnelId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the result
          const firstName = result.data.personnel[0].firstName;
          const lastName = result.data.personnel[0].lastName;
         
          // Simply update the name in the existing HTML
          document.getElementById("personnelFullName").textContent = `${firstName} ${lastName}`;
        }
      }
    });
  });

  // Delete Personnel Form Submit
  $("#deletePersonnelForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the personnel ID from the hidden input
    const personnelId = $("#deletePersonnelID").val();

    // AJAX call to delete the personnel
    $.ajax({
      url: "libs/php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: personnelId
      },

      success: function (result) {   

        if (result.status.code == 200) {

          // Get the personnel name from the modal
          const personnelName = $("#personnelFullName").text();
          // Show success message and refresh the personnel table
          getAllPersonnel();
          $("#deletePersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully deleted.`);

        }
      }
    });
  });

  // Delete Department Modal Show
  $("#deleteDepartmentsModal").on("show.bs.modal", function (e) {
    // Get the department ID from the button that triggered the modal
    const departmentId = $(e.relatedTarget).attr("data-id");

    // Set the hidden input value
    $("#deleteDepartmentsID").val(departmentId);

    // Get department name and personnel count
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: departmentId
      },
      success: function (result) {
        if (result.status.code == 200) {
          // Get the department name and personnel count from the result
          const departmentName = result.data.department[0].name;
          const personnelCount = parseInt(result.data.department[0].personnelCount);
          
          // Show/hide buttons
          $("#deleteDepartmentsBtns").show();
          $("#deleteDepartmentsCancelBtn").show();

          if (personnelCount > 0) {
            // Can't delete - show error message
            $("#departmentNameError").text(departmentName);
            $("#personnelCount").text(`${personnelCount} Personnel`);
            $("#departmentErrorMessage").show();
            $("#departmentConfirmMessage").hide();
            
            // Hide delete button
            $("#deleteDepartmentsBtns").hide();
          } else {
            // Can delete - show confirmation message
            $("#departmentNameConfirm").text(departmentName);
            $("#departmentConfirmMessage").show();
            $("#departmentErrorMessage").hide();
          }
        }
      }
    });
  });

  // Delete Department Form Submit
  $("#deleteDepartmentsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();

    const departmentId = $("#deleteDepartmentsID").val();

    // AJAX call to delete the department
    $.ajax({
      url: "libs/php/deleteDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: departmentId
      },

      success: function (result) {
        // If the result code is 200, show success message and refresh the department table
        if (result.status.code == 200) {

          const departmentName = $("#departmentConfirmMessage strong").text();
          getAllDepartments();
          $("#deleteDepartmentsModal").modal("hide");
          showSuccessToast(`${departmentName} has been successfully deleted.`);

        }
      }
    });
  });

  // Delete Location Modal Show
  $("#deleteLocationsModal").on("show.bs.modal", function (e) {  
    // Get the location ID from the button that triggered the modal 
    const locationId = $(e.relatedTarget).attr("data-id");
    
    // Set the hidden input value
    $("#deleteLocationsID").val(locationId);
    
    // Get location name and department count   
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: locationId
      },
      success: function (result) {
        // If the result code is 200, get the location name and department count
        if (result.status.code == 200) {
          const locationName = result.data[0].name;
          const departmentCount = parseInt(result.data[0].departmentCount);
          
          // Show/hide buttons
          $("#deleteLocationsBtns").show();
          $("#deleteLocationsCancelBtn").show();

          if (departmentCount > 0) {
            // Can't delete - show error message
            $("#locationNameError").text(locationName);
            $("#departmentCount").text(`${departmentCount} Departments`);
            $("#locationErrorMessage").show();
            $("#locationConfirmMessage").hide();
            
            // Hide delete button
            $("#deleteLocationsBtns").hide();
          } else {
            // Can delete - show confirmation message
            $("#locationNameConfirm").text(locationName);
            $("#locationConfirmMessage").show();
            $("#locationErrorMessage").hide();
          }
        }
      }
    });
  });

  // Delete Location Form Submit
  $("#deleteLocationsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the location ID from the hidden input
    const locationId = $("#deleteLocationsID").val();
    // AJAX call to delete the location
    $.ajax({
      url: "libs/php/deleteLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: locationId
      },
      success: function (result) {    
        if (result.status.code == 200) {
          // Get the location name from the strong element in the visible message div
          const locationName = $("#locationConfirmMessage strong").text();
          getAllLocations();
          $("#deleteLocationsModal").modal("hide");
          showSuccessToast(`${locationName} has been successfully deleted.`);
        }
      }
    });
  });

  /*----------------------------------------*/
  /* SEARCH FUNTCION */
  /*----------------------------------------*/

  // Clear search input
  function clearSearchInput() {
    $("#searchInp").val("");
  }

  // Search Input
  $("#searchInp").on("keyup", function () {
    // Clear the table before appending new data
    const searchInput = $(this).val();
    filterActive = false;
    updateFilterActiveState();    
    // Personel table
    if ($("#personnelBtn").hasClass("active")) {;
      // If the search input is empty, show all personnel     
      $.ajax({
        url: "libs/php/searchAllPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) { 

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("personnel");

            // Create a document fragment to improve performance
            const frag = document.createDocumentFragment();

            if(result.data && result.data.length > 0) {

              result.data.forEach(function(personnel) {
                // Create a row with data attributes for filtering
                const row = document.createElement("tr");
                row.setAttribute("data-department-name", personnel.departmentName);
                row.setAttribute("data-location-name", personnel.locationName);

                // Name cell
                const nameCell = document.createElement("td");
                nameCell.className = "align-middle text-nowrap";
                nameCell.textContent = `${personnel.lastName}, ${personnel.firstName}`;
                row.appendChild(nameCell);

                // Department cell
                const deptCell = document.createElement("td");
                deptCell.className = tdClass;
                deptCell.textContent = personnel.departmentName;
                row.appendChild(deptCell);

                // Location cell
                const locCell = document.createElement("td");
                locCell.className = tdClass;
                locCell.textContent = personnel.locationName;
                row.appendChild(locCell);

                // Email cell
                const emailCell = document.createElement("td");
                emailCell.className = tdClass;
                emailCell.textContent = personnel.email;
                row.appendChild(emailCell);

                // Action cell
                const actionCell = document.createElement("td");
                actionCell.className = "text-end pe-0";
                actionCell.appendChild(createButtonElement(personnel.id, "edit"));
                actionCell.appendChild(createButtonElement(personnel.id, "delete"));
                row.appendChild(actionCell);

                // Add row to fragment
                frag.appendChild(row);

              });

            } else {

              // Create "No data found" row using document fragment
              const row = document.createElement("tr");
              const cell = document.createElement("td");
              cell.setAttribute("colspan", "6");
              cell.className = "text-center";
              cell.textContent = "No data found";
              row.appendChild(cell);
              frag.appendChild(row);
            }

            // Append the fragment to the table body
            document.getElementById("personnelTableBody").appendChild(frag);

          }
        }
      });

    // Department table
    } else if ($("#departmentsBtn").hasClass("active")) {
      // If the search input is empty, show all departments      
      $.ajax({
        url: "libs/php/searchAllDepartments.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) {

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("departments");

            // Create a document fragment to improve performance
            const frag = document.createDocumentFragment();

            if(result.data && result.data.length > 0) {

              result.data.forEach(function(department) {
                // Create a row
                const row = document.createElement("tr");
                
                // Department name cell
                const nameCell = document.createElement("td");
                nameCell.className = "align-middle text-nowrap";
                nameCell.textContent = department.name;
                row.appendChild(nameCell);
                
                // Location cell
                const locationCell = document.createElement("td");
                locationCell.className = tdClass;
                locationCell.textContent = department.locationName;
                row.appendChild(locationCell);
                
                // Action cell
                const actionCell = document.createElement("td");
                actionCell.className = "text-end pe-0";
                actionCell.appendChild(createButtonElement(department.id, "edit", "Departments"));
                actionCell.appendChild(createButtonElement(department.id, "delete", "Departments"));
                row.appendChild(actionCell);
                
                // Add row to fragment
                frag.appendChild(row);
              });

            } else {

              // Create "No data found" row
              const row = document.createElement("tr");
              const cell = document.createElement("td");
              cell.setAttribute("colspan", "3"); // Only 3 columns in department table
              cell.className = "text-center";
              cell.textContent = "No data found";
              row.appendChild(cell);
              frag.appendChild(row);

            }
            
            // Append the fragment to the table body
            document.getElementById("departmentTableBody").appendChild(frag);

          }
        }
      });  

    // Location table
    } else { 
      // If the search input is empty, show all locations     
      $.ajax({
        url: "libs/php/searchAllLocations.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) { 

          if (result.status.code == 200) {
            // Clear the table before appending new data
            clearTable("locations");
         // Create a document fragment to improve performance
          const frag = document.createDocumentFragment();
          
          if(result.data && result.data.length > 0) { 
            
            result.data.forEach(function(location) {
              // Create a row
              const row = document.createElement("tr");
              
              // Location name cell
              const nameCell = document.createElement("td");
              nameCell.className = "align-middle text-nowrap";
              nameCell.textContent = location.name;
              row.appendChild(nameCell);
              
              // Action cell
              const actionCell = document.createElement("td");
              actionCell.className = "text-end pe-0";
              actionCell.appendChild(createButtonElement(location.id, "edit", "Locations"));
              actionCell.appendChild(createButtonElement(location.id, "delete", "Locations"));
              row.appendChild(actionCell);
              
              // Add row to fragment
              frag.appendChild(row);

            });

          } else {

            // Create "No data found" row
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.setAttribute("colspan", "2"); // Only 2 columns in location table
            cell.className = "text-center";
            cell.textContent = "No data found";
            row.appendChild(cell);
            frag.appendChild(row);

          }
          
          // Append the fragment to the table body
          document.getElementById("locationTableBody").appendChild(frag);

          };
        }
      });
    };
  });

  /*----------------------------------------*/
  /* FILTER FUNCTIONS */
  /*----------------------------------------*/

  // Update filter button state
  function updateFilterButtonState() {
    // Enable filter button if personnel button is active
    if ($("#personnelBtn").hasClass("active")) {
      $("#filterBtn").prop("disabled", false).removeAttr("disabled");
    // Disable filter button if personnel button is not active
    } else {

      $("#filterBtn").prop("disabled", true).attr("disabled", "disabled");

    }
  };

  // Filter Active State
  let filterActive = false;

  // Update Filter Active State
  function updateFilterActiveState() {
    // Update filter button state based on filterActive variable
    if (filterActive) {

      $("#filterBtn").addClass("active");
    // If filterActive is false, remove active class
    } else {

      $("#filterBtn").removeClass("active");

    }
  };

  // Reset Filter Dropdowns
  function resetFilterDropdowns() {
    // Reset filter dropdowns to default values
    $("#filterPersonnelDepartment").html('<option value="">Any Department</option>');
    $("#filterPersonnelLocation").html('<option value="">Any Location</option>');

  };

  // Filter Personnel Modal Show
  $("#filterPersonnelModal").on("show.bs.modal", function () {
    // Show filter button as active
    $("#filterBtn").addClass("active");
    
    $.ajax({
      url: "libs/php/filterDropdown.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the filter dropdowns before appending new data
          $.each(result.data.department, function () {

            $("#filterPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Clear the filter dropdowns before appending new data
          $.each(result.data.location, function () {

            $("#filterPersonnelLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })

            );
          });

        }
      }
    });
  });

  // Filter Personnel Department Change
  $("#filterPersonnelDepartment").on("change", function() {
    const departmentId = $(this).val();
    const departmentName = $(this).find("option:selected").text();
    
    if (departmentId !== "") {
      // Clear the other filter
      $("#filterPersonnelLocation").val("");
      
      // Show/hide rows based on department name
      let foundMatches = false;
      $("#personnelTableBody tr").each(function() {
        const rowDeptName = $(this).attr("data-department-name");
        
        if (rowDeptName === departmentName) {
          $(this).show();
          foundMatches = true;
        } else {
          $(this).hide();
        }
      });
      
      // Set filter state
      filterActive = true;
    } else {
      // If "Any Department" is selected, show all rows
      $("#personnelTableBody tr").show();
      filterActive = false;
    }
    
    updateFilterActiveState();
  });

  // Filter Personnel Location Change
  $("#filterPersonnelLocation").on("change", function() {
    const locationId = $(this).val();
    const locationName = $(this).find("option:selected").text();
    
    if (locationId !== "") {
      // Clear the other filter
      $("#filterPersonnelDepartment").val("");
      
      // Show/hide rows based on location name
      let foundMatches = false;
      $("#personnelTableBody tr").each(function() {
        const rowLocName = $(this).attr("data-location-name");
        
        if (rowLocName === locationName) {
          $(this).show();
          foundMatches = true;
        } else {
          $(this).hide();
        }
      });
      
      // Set filter state
      filterActive = true;
    } else {
      // If "Any Location" is selected, show all rows
      $("#personnelTableBody tr").show();
      filterActive = false;
    }
    
    updateFilterActiveState();
  });

  // Filter Personnel Modal Hide
  $("#filterPersonnelModal").on("hide.bs.modal", function() {

    updateFilterActiveState();
  });

  /*----------------------------------------*/
  /* ADD FUNCTIONS */
  /*----------------------------------------*/

  // Add Personnel Modal Show
  $("#addPersonnelModal").on("show.bs.modal", function () {

    $("#addPersonnelDepartment").empty();
    $("#addPersonnelError").hide();

    // Get all departments
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the department dropdown before appending new data
          $.each(result.data, function () {
            $("#addPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }
      }
    })
  });

  // Add Personnel Form Submit
  $("#addPersonnelForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const firstName = $("#addPersonnelFirstName").val();
    const lastName = $("#addPersonnelLastName").val();
    const jobTitle = $("#addPersonnelJobTitle").val();
    const email = $("#addPersonnelEmailAddress").val();
    const department = $("#addPersonnelDepartment").val();
    
    $.ajax({
      url: "libs/php/insertPersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
        firstName: firstName,
        lastName: lastName,
        jobTitle: jobTitle,
        email: email,
        departmentID: department
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the form and show success toast
          const personnelName = `${firstName} ${lastName}`;
          getAllPersonnel();
          $("#addPersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully added.`);

        } else if (result.status.code == 409) {
          // Personnel with the same email already exists
          $("#addPersonnelError").css('display', 'block').show();

        }

      }

    });
  });

  // Add Personnel Modal Hide
  $("#addPersonnelModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });

  // Add Department Modal Show
  $("#addDepartmentsModal").on("show.bs.modal", function () {

    $("#addDepartmentsLocation").empty();
    $("#addDepartmentsError").hide();

    // Get all locations
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
        
        if (result.status.code == 200) {
          // Clear the location dropdown before appending new data
          $.each(result.data, function () {
            $("#addDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

        }

      }

    })
  });

  // Add Department Form Submit
  $("#addDepartmentsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const name = $("#addDepartmentsName").val();
    const location = $("#addDepartmentsLocation").val();
    const locationName = $("#addDepartmentsLocation option:selected").text();
    
    // AJAX call to save form data
    $.ajax({
      url: "libs/php/insertDepartment.php",
      type: "POST",
      dataType: "json",
      data: {
        name: name,
        locationID: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name from the form and show success toast
          getAllDepartments();
          $("#addDepartmentsModal").modal("hide");
          showSuccessToast(`${name} has been successfully added.`);

        } else if (result.status.code == 409) {
          // Department already exists
          $("#addDepartmentsError").css('display', 'block').show();

        }
      }

    });
  });

  // Add Department Modal Hide
  $("#addDepartmentsModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });

  // Add Location Modal Show
  $("#addLocationsModal").on("show.bs.modal", function () {

    $("#addLocationsError").hide();

  });

  // Add Location Form Submit
  $("#addLocationsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const name = $("#addLocationsName").val();

    // AJAX call to save form data
    $.ajax({
      url: "libs/php/insertLocation.php",
      type: "POST",
      dataType: "json",
      data: {
        name: name
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the form and show success toast
          getAllLocations();
          $("#addLocationsModal").modal("hide");
          showSuccessToast(`${name} has been successfully added.`);

        } else if (result.status.code == 409) {

          // Location already exists
          $("#addLocationsError").css('display', 'block').show();

        }
      }

    });
  });

  // Add Location Modal Hide
  $("#addLocationsModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });

  /*----------------------------------------*/
  /* EDIT FUNCTIONS */
  /*----------------------------------------*/

  // Edit Personnel Modal Show
  $("#editPersonnelModal").on("show.bs.modal", function (e) {

    $("#editPersonnelDepartment").empty();
    $("#editPersonnelError").hide();

    // AJAX call to get personnel data by ID
    $.ajax({
      url:
        "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id") 
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);
          $("#editPersonnelDepartment").html("");
          // Clear the department dropdown before appending new data
          $.each(result.data.department, function () {

            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Update hidden form value of departmentID
          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);

        }

      }
    });
  });

  // Edit Personnel Modal Submit
  $("#editPersonnelForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const firstName = $("#editPersonnelFirstName").val();
    const lastName = $("#editPersonnelLastName").val();
    const jobTitle = $("#editPersonnelJobTitle").val();
    const email = $("#editPersonnelEmailAddress").val();
    const department = $("#editPersonnelDepartment").val();

    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updatePersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editPersonnelEmployeeID").val(),
        firstName: firstName,
        lastName: lastName,
        jobTitle: jobTitle,
        email: email,
        departmentID: department
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the personnel name from the form and show success toast
          const personnelName = `${firstName} ${lastName}`;
          getAllPersonnel();
          $("#editPersonnelModal").modal("hide");
          showSuccessToast(`${personnelName} has been successfully edited.`);

        } else if (result.status.code == 409) {

          // Personnel already exists
          $("#editPersonnelError").css('display', 'block').show();

        }

      }

    });
  });

  // Edit Personnel Modal Hide
  $("#editPersonnelModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });

  // Edit Department Modal Show
  $("#editDepartmentsModal").on("show.bs.modal", function (e) {

    $("#editDepartmentsLocation").empty();
    $("#editDepartmentsError").hide();
    
    // Get the department ID from the button that triggered the modal
    const departmentId = $(e.relatedTarget).attr("data-id");
    $("#editDepartmentsID").val(departmentId);
    // Get department name and locations
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: departmentId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name and locations from the result
          $("#editDepartmentsName").val(result.data.department[0].name);
          $("#editDepartmentsLocation").html("");
          // Clear the location dropdown before appending new data
          $.each(result.data.locations, function () {

            $("#editDepartmentsLocation").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );

          });
          // Update hidden form value of locationID
          $("#editDepartmentsLocation").val(result.data.department[0].locationID);

        }

      }

    });
  }); 

  // Edit Department Modal Submit
  $("#editDepartmentsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const department = $("#editDepartmentsName").val();
    const location = $("#editDepartmentsLocation").val();
    const locationName = $("#editDepartmentsLocation option:selected").text();

    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updateDepartments.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editDepartmentsID").val(),
        name: department,
        locationID: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the department name from the form and show success toast
          getAllDepartments();
          $("#editDepartmentsModal").modal("hide");
          showSuccessToast(`${department} has been successfully edited.`);

        } else if (result.status.code == 409) {
          // Department already exists
          $("#editDepartmentsError").css('display', 'block').show();

        }

      }

    });
  });

  // Edit Department Modal Hide
  $("#editDepartmentsModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });
  
  // Edit Location Modal Show
  $("#editLocationsModal").on("show.bs.modal", function (e) {

    $("#editLocationsError").hide();

    // Get the location ID from the button that triggered the modal
    const locationId = $(e.relatedTarget).attr("data-id");
    $("#editLocationsID").val(locationId);
    // Get location name
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: locationId
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the result
          $("#editLocationsName").val(result.data[0].name);

        }

      }

    });
  });

  // Edit Location Modal Submit
  $("#editLocationsForm").on("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Get the form values
    const location = $("#editLocationsName").val();

    // AJAX call to save form data
    $.ajax({
      url: "libs/php/updateLocations.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#editLocationsID").val(),
        name: location
      },

      success: function (result) {

        if (result.status.code == 200) {
          // Get the location name from the form and show success toast
          getAllLocations();
          $("#editLocationsModal").modal("hide");
          showSuccessToast(`${location} has been successfully edited.`);

        } else if (result.status.code == 409) {

          // Location already exists
          $("#editLocationsError").css('display', 'block').show();

        }

      }

    });
  });

  // Edit Location Modal Hide
  $("#editLocationsModal").on("hidden.bs.modal", function () {
    // Reset the form
    $(this).find("form")[0].reset();

  });

  /*----------------------------------------*/
  /* BUTTON FUNCTIONS */
  /*----------------------------------------*/

  $("#refreshBtn").click(function () {
    // Refresh the table based on the active button
    resetFilterDropdowns();
    clearSearchInput();
    filterActive = false;
    updateFilterActiveState();
    
    $("#personnelTableBody tr").show();
    if ($("#personnelBtn").hasClass("active")) {

      // Refresh personnel table
      getAllPersonnel();

    } else if ($("#departmentsBtn").hasClass("active")) {

      // Refresh department table
      getAllDepartments();

    } else {

      // Refresh location table
      getAllLocations();

    }

  });

  // Filter Button
  $("#filterBtn").click(function () {
    
    $("#filterPersonnelModal").modal("show");
    
  });

  // Add Button
  $("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {
      
      $("#addPersonnelModal").modal("show");
    
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $("#addDepartmentsModal").modal("show");

    } else {
      
      $("#addLocationsModal").modal("show");

    }

  });

  // Personnel, Departments, and Locations Button Click
  $("#personnelBtn").click(function () {

    // Call function to refresh personnel table
    $("#searchInp").attr("placeholder", "Search Personnel");
    filterActive = false;
    updateFilterActiveState();
    resetFilterDropdowns();
    getAllPersonnel();
    clearSearchInput();
    updateFilterButtonState();

  });
  
  $("#departmentsBtn").click(function () {

    $("#searchInp").attr("placeholder", "Search Departments");
    // Call function to refresh department table
    getAllDepartments();
    clearSearchInput();
    updateFilterButtonState();

  });
  
  $("#locationsBtn").click(function () {

    $("#searchInp").attr("placeholder", "Search Locations");
    // Call function to refresh location table
    getAllLocations();
    clearSearchInput();
    updateFilterButtonState();

  });

});