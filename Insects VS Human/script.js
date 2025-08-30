// Хранилище данных
let applications = JSON.parse(localStorage.getItem('applications')) || [];
let isDeveloper = false;

// Имитация входа через Google
document.getElementById('googleSignIn').addEventListener('click', function() {
    const userName = "Администратор";
    const userInitial = userName.charAt(0);
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = userInitial;
    document.getElementById('userPanel').classList.remove('hidden');
    document.getElementById('googleSignIn').classList.add('hidden');
    
    // Показываем сообщение об успешном входе
    showNotification('Успешный вход через Google!', 'success');
});

function logout() {
    document.getElementById('userPanel').classList.add('hidden');
    document.getElementById('googleSignIn').classList.remove('hidden');
    isDeveloper = false;
    showInfo('default-info');
}

function showInfo(type) {
    // Скрыть все информационные блоки
    document.querySelectorAll('.info-panel > div').forEach(div => {
        div.classList.add('hidden');
    });
    
    // Показать выбранный информационный блок
    document.getElementById(`${type}-info`).classList.remove('hidden');
    
    // Если это просмотр анкет и пользователь разработчик - загрузить анкеты
    if (type === 'view' && isDeveloper) {
        loadApplications();
    }
}

function checkDevKey() {
    const key = document.getElementById('devKey').value;
    if (key === "insect123") {
        isDeveloper = true;
        showNotification('Доступ разрешен! Добро пожаловать, разработчик!', 'success');
        showInfo('view');
    } else {
        showNotification('Неверный ключ доступа!', 'error');
    }
}

function submitApplication() {
    const name = document.getElementById('applicantName').value;
    const email = document.getElementById('applicantEmail').value;
    const experience = document.getElementById('applicantExperience').value;
    const message = document.getElementById('applicantMessage').value;
    
    if (!name || !email || !experience || !message) {
        showNotification('Пожалуйста, заполните все поля!', 'error');
        return;
    }
    
    // Проверка email
    if (!isValidEmail(email)) {
        showNotification('Пожалуйста, введите корректный email адрес!', 'error');
        return;
    }
    
    const newApplication = {
        id: Date.now(),
        name,
        email,
        experience,
        message,
        status: 'pending',
        date: new Date().toLocaleDateString('ru-RU')
    };
    
    applications.push(newApplication);
    saveApplications();
    
    // Очистка формы
    document.getElementById('applicantName').value = '';
    document.getElementById('applicantEmail').value = '';
    document.getElementById('applicantExperience').value = '';
    document.getElementById('applicantMessage').value = '';
    
    // Имитация отправки email
    sendEmail(email, 
        'Спасибо что выбрали нас!', 
        `Уважаемый(ая) ${name},\n\nСпасибо за вашу заявку! В течении 48 часов вы получите ответ на ваше сообщение!\n\nДля дополнительных вопросов пишите на @Po11and\n\nС уважением,\nКоманда "Насекомые против Людей"`
    );
    
    showNotification('Анкета успешно отправлена! В течение 48 часов вы получите ответ.', 'success');
    showInfo('default-info');
}

function loadApplications() {
    const container = document.getElementById('applicationsContainer');
    container.innerHTML = '';
    
    if (applications.length === 0) {
        container.innerHTML = '<p class="info-content">Анкет пока нет.</p>';
        return;
    }
    
    applications.forEach(app => {
        const statusClass = 
            app.status === 'approved' ? 'status-approved' :
            app.status === 'rejected' ? 'status-rejected' : 'status-pending';
        
        const statusText = 
            app.status === 'approved' ? 'Одобрена' :
            app.status === 'rejected' ? 'Отклонена' : 'На рассмотрении';
        
        const applicationEl = document.createElement('div');
        applicationEl.className = 'application-item';
        applicationEl.innerHTML = `
            <div class="application-header">
                <div>
                    <h3>${app.name}</h3>
                    <p>${app.email} • Опыт: ${app.experience} лет • ${app.date}</p>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <p>${app.message}</p>
            ${app.status === 'rejected' && app.rejectionReason ? 
                `<p><strong>Причина отклонения:</strong> ${app.rejectionReason}</p>` : ''}
            ${app.status === 'approved' && app.devKey ? 
                `<p><strong>Ключ разработчика:</strong> ${app.devKey}</p>` : ''}
            ${app.status === 'pending' ? `
            <div class="application-actions">
                <button class="action-btn approve-btn" onclick="approveApplication(${app.id})">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="action-btn reject-btn" onclick="rejectApplication(${app.id})">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>
            ` : ''}
        `;
        
        container.appendChild(applicationEl);
    });
}

function approveApplication(id) {
    const application = applications.find(app => app.id === id);
    if (application) {
        application.status = 'approved';
        application.devKey = generateDevKey();
        saveApplications();
        loadApplications();
        
        // Имитация отправки email
        sendEmail(application.email, 
            'Поздравляем! Вас приняли в команду!', 
            `Уважаемый(ая) ${application.name},\n\nПоздравляем! Ваша анкета одобрена. Спасибо что выбрали нас! Вы стали разработчиком!\n\nВаш ключ доступа: ${application.devKey}\n\nПо подробностям пишите на @Po11and\n\nС уважением,\nКоманда "Насекомые против Людей"`
        );
        
        showNotification('Анкета одобрена! Кандидат получил уведомление.', 'success');
    }
}

function rejectApplication(id) {
    const reason = prompt('Введите причину отклонения анкеты:');
    if (reason === null) return;
    
    if (!reason.trim()) {
        showNotification('Необходимо указать причину отклонения!', 'error');
        return;
    }
    
    const application = applications.find(app => app.id === id);
    if (application) {
        application.status = 'rejected';
        application.rejectionReason = reason;
        saveApplications();
        loadApplications();
        
        // Имитация отправки email
        sendEmail(application.email, 
            'Решение по вашей заявке', 
            `Уважаемый(ая) ${application.name},\n\nСожалеем, но вы нам не подходите. Причина: ${reason}\n\nПо вопросам пишите на @Po11and\n\nС уважением,\nКоманда "Насекомые против Людей"`
        );
        
        showNotification('Анкета отклонена! Кандидат получил уведомление.', 'success');
    }
}

function saveApplications() {
    localStorage.setItem('applications', JSON.stringify(applications));
}

function generateDevKey() {
    return 'dev_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sendEmail(email, subject, message) {
    console.log(`=== Email отправлен на ${email} ===`);
    console.log(`Тема: ${subject}`);
    console.log(`Сообщение:\n${message}`);
    console.log('================================');
    
    // В реальном приложении здесь был бы код для отправки email
    // через EmailJS, SendGrid, или другой email-сервис
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    
    messageEl.textContent = message;
    notification.className = 'notification';
    
    if (type === 'success') {
        notification.classList.add('notification-success');
    } else if (type === 'error') {
        notification.classList.add('notification-error');
    }
    
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
}