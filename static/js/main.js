document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    
    if(sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            if(sidebar.classList.contains('active')) {
                sidebar.style.marginLeft = '-250px';
            } else {
                sidebar.style.marginLeft = '0';
            }
        });
    }

    // Initialize Chart if canvas exists
    const ctx = document.getElementById('taskStatusChart');
    if (ctx) {
        fetch('/api/chart-data')
            .then(response => response.json())
            .then(data => {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Open', 'In Progress', 'Blocked', 'Completed'],
                        datasets: [{
                            data: [data['Open'], data['In Progress'], data['Blocked'], data['Completed']],
                            backgroundColor: [
                                '#dfe1e6', // Open
                                '#0052cc', // In Progress
                                '#bf2600', // Blocked
                                '#00875a'  // Completed
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            }
                        }
                    }
                });
            });
    }

    // Auto-dismiss alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});
