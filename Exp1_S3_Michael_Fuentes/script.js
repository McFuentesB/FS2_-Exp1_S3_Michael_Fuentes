// Configuración inicial para asegurarse de que existe un usuario administrador
(function initializeAdminUser() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const adminExists = usuarios.some(user => user.role === 'admin');

    if (!adminExists) {
        const adminUser = {
            nombre: "Administrador",
            usuario: "admin",
            email: "admin@example.com",
            clave: "Admin123",
            role: "admin"
        };
        usuarios.push(adminUser);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        console.log("Usuario administrador creado con credenciales predeterminadas.");
    }
})();

// Registro de Usuario
document.getElementById('formulario-registro')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const clave = document.getElementById('clave').value;
    const repetirClave = document.getElementById('repetir-clave').value;
    const fechaNacimiento = new Date(document.getElementById('fecha-nacimiento').value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    // Validaciones de clave y edad
    if (clave !== repetirClave) {
        alert('Las contraseñas no coinciden.');
        return;
    }
    if (!/(?=.*[0-9])(?=.*[A-Z])/.test(clave) || clave.length < 6 || clave.length > 18) {
        alert('La contraseña debe contener al menos un número, una letra mayúscula y tener entre 6 y 18 caracteres.');
        return;
    }
    if (edad < 18) { 
        alert('Debes tener al menos 18 años para registrarte.');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = {
        nombre: document.getElementById('nombre').value,
        usuario: document.getElementById('usuario').value,
        email: document.getElementById('email').value,
        clave: clave,
        fechaNacimiento: fechaNacimiento.toISOString(),
        role: "user" // Asignamos "user" por defecto; los admins se crean manualmente
    };

    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    window.location.href = 'login.html';
});

// Inicio de Sesión
document.getElementById('formulario-login')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const usuario = document.getElementById('login-usuario').value;
    const clave = document.getElementById('login-clave').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const currentUser = usuarios.find(u => u.usuario === usuario && u.clave === clave);
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'dashboard.html';
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// Cerrar Sesión
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Renderizar habitaciones disponibles en el selector
function renderRoomSelect() {
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const roomSelect = document.getElementById('roomSelect');
    
    roomSelect.innerHTML = ''; // Limpiar opciones existentes
    rooms.forEach((room, index) => {
        const option = document.createElement('option');
        option.value = index; // Usamos el índice como valor para identificar la habitación
        option.textContent = `${room.name} - Capacidad: ${room.capacity} - Precio: ${room.price}`;
        roomSelect.appendChild(option);
    });
}

// Renderizar reservas de usuarios
function renderUserReservations() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const userReservations = reservations.filter(r => r.user === currentUser.usuario);
    
    const tableBody = document.getElementById('userReservationsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    userReservations.forEach((reservation, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = reservation.checkIn;
        row.insertCell(2).textContent = reservation.checkOut;
        row.insertCell(3).textContent = reservation.room; // Mostrar el nombre de la habitación
        
        const actionsCell = row.insertCell(4);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => deleteUserReservation(reservation);
        actionsCell.appendChild(deleteButton);
    });
}


// Renderizar Reservas en el Dashboard
function renderReservations() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert("Debes iniciar sesión.");
        window.location.href = 'login.html';
        return;
    }

    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const tableBody = document.getElementById('reservationsTable')?.getElementsByTagName('tbody')[0];
    if (!tableBody) return;

    tableBody.innerHTML = '';
    reservations.forEach((reservation, index) => {
        if (currentUser.role === 'admin' || reservation.user === currentUser.usuario) {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = reservation.user;
            row.insertCell(2).textContent = reservation.checkIn;
            row.insertCell(3).textContent = reservation.checkOut;

            const actionsCell = row.insertCell(4);
            if (currentUser.role === 'admin' || reservation.user === currentUser.usuario) {
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.classList.add('btn', 'btn-warning', 'me-2');
                editButton.onclick = () => editReservation(index);
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.classList.add('btn', 'btn-danger');
                deleteButton.onclick = () => deleteReservation(index);
                actionsCell.appendChild(deleteButton);
            }
        }
    });
}

// Agregar Nueva Reserva
document.getElementById('reservationForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert("Debes iniciar sesión.");
        window.location.href = 'login.html';
        return;
    }

    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const roomIndex = document.getElementById('roomSelect').value; // Obtener el índice de la habitación seleccionada
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const selectedRoom = rooms[roomIndex]; // Obtener la habitación seleccionada

    const newReservation = {
        user: currentUser.usuario,
        checkIn: document.getElementById('resCheckIn').value,
        checkOut: document.getElementById('resCheckOut').value,
        room: selectedRoom.name // Guardar el nombre de la habitación
    };

    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    renderUserReservations();
    alert("Reserva añadida con éxito.");
});


// Editar Reserva (Función básica, puede ser ampliada)
function editReservation(index) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations[index];

    document.getElementById('resUser').value = reservation.user;
    document.getElementById('resCheckIn').value = reservation.checkIn;
    document.getElementById('resCheckOut').value = reservation.checkOut;

    // Guardar cambios en la reserva actual
    document.getElementById('reservationForm').onsubmit = function(event) {
        event.preventDefault();
        reservation.checkIn = document.getElementById('resCheckIn').value;
        reservation.checkOut = document.getElementById('resCheckOut').value;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        renderReservations();
        alert("Reserva actualizada.");
    };
}

// Eliminar Reserva
function deleteReservation(index) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.splice(index, 1);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    renderReservations();
}

// Eliminar Reserva de Usuario
function deleteUserReservation(reservation) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Filtrar reservas para eliminar la que coincida con el usuario y las fechas
    const updatedReservations = reservations.filter(r => 
        r.user !== reservation.user || 
        r.checkIn !== reservation.checkIn || 
        r.checkOut !== reservation.checkOut
    );
    
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    renderUserReservations();
}


// Renderizar habitaciones (para admin)
function renderRooms() {
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const tableBody = document.getElementById('roomsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    rooms.forEach((room, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = room.name;
        row.insertCell(2).textContent = room.capacity;
        row.insertCell(3).textContent = room.price;

        const actionsCell = row.insertCell(4);
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('btn', 'btn-warning', 'me-2');
        editButton.onclick = () => editRoom(index);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => deleteRoom(index);
        actionsCell.appendChild(deleteButton);
    });
}

// Agregar Nueva Habitación
document.getElementById('roomForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const newRoom = {
        name: document.getElementById('roomName').value,
        capacity: document.getElementById('roomCapacity').value,
        price: document.getElementById('roomPrice').value
    };

    rooms.push(newRoom);
    localStorage.setItem('rooms', JSON.stringify(rooms));
    alert("Habitación añadida con éxito.");
    renderRooms();
});

// Editar Habitación
function editRoom(index) {
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const room = rooms[index];

    document.getElementById('roomName').value = room.name;
    document.getElementById('roomCapacity').value = room.capacity;
    document.getElementById('roomPrice').value = room.price;

    // Guardar cambios en la habitación actual
    document.getElementById('roomForm').onsubmit = function(event) {
        event.preventDefault();
        room.name = document.getElementById('roomName').value;
        room.capacity = document.getElementById('roomCapacity').value;
        room.price = document.getElementById('roomPrice').value;
        localStorage.setItem('rooms', JSON.stringify(rooms));
        renderRooms();
        alert("Habitación actualizada.");
    };
}

// Eliminar Habitación
function deleteRoom(index) {
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    rooms.splice(index, 1);
    localStorage.setItem('rooms', JSON.stringify(rooms));
    renderRooms();
}

// Verificar acceso de usuario
function checkUserAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert("Debes iniciar sesión.");
        window.location.href = 'login.html';
    }

    // Verificamos si es admin
    if (currentUser.role === 'admin') {
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('userSection').style.display = 'none';
        renderRooms();
    } else {
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
        renderRoomSelect(); // Llenamos el selector de habitaciones
        renderUserReservations();
    }
}

// Ejecutar al cargar el documento
window.onload = function() {
    if (window.location.pathname.endsWith('dashboard.html')) {
        checkUserAccess();
    }
};

// Función para cargar las reservas del usuario
function loadUserReservations() {
    const userReservationsTable = document.getElementById('userReservationsTable').getElementsByTagName('tbody')[0];

    // Suponiendo que tienes un arreglo `userReservations` con los datos de las reservas
    userReservationsTable.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos

    userReservations.forEach((reservation, index) => {
        const row = userReservationsTable.insertRow();
        row.insertCell(0).textContent = index + 1; // Número de reserva
        row.insertCell(1).textContent = reservation.checkIn; // Fecha de Check-In
        row.insertCell(2).textContent = reservation.checkOut; // Fecha de Check-Out
        row.insertCell(3).textContent = reservation.roomName; // Nombre de la habitación
        const actionsCell = row.insertCell(4);
        
        // Aquí puedes agregar botones de acción si es necesario
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.className = 'btn btn-danger';
        cancelButton.onclick = () => cancelReservation(reservation.id); // Función para cancelar la reserva
        actionsCell.appendChild(cancelButton);
    });
}

// Suponiendo que este es el método que obtiene las reservas y se llama en el evento correspondiente
loadUserReservations();

document.getElementById('profileLink').addEventListener('click', function(event) {
    event.preventDefault(); // Evita la acción predeterminada del enlace
    window.location.href = 'profile.html'; // Redirige a la página de perfil
});


// Cargar la información del usuario en el formulario
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('nombre').value = currentUser.nombre;
        document.getElementById('usuario').value = currentUser.usuario;
        document.getElementById('email').value = currentUser.email;
    } else {
        alert("Debes iniciar sesión.");
        window.location.href = 'login.html';
    }
}

// Guardar cambios del perfil
document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.nombre = document.getElementById('nombre').value;
        currentUser.usuario = document.getElementById('usuario').value;
        currentUser.email = document.getElementById('email').value;

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert("Información actualizada con éxito.");
    }
});

// Ejecutar al cargar la página de perfil
window.onload = loadUserProfile;




