function NotificationPanel({ notifications = [] }) {
  return (
    <section className="panel notification-panel">
      <div className="panel-header">
        <div>
          <span className="section-kicker">UPDATES</span>
          <h2>Notifications</h2>
        </div>

        <span className="notification-count">
          {notifications.length}
        </span>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <div
            className="notification-item"
            key={notification.id}
          >
            <div className="notification-icon">
              {notification.type === "case"
                ? "!"
                : notification.type === "sighting"
                ? "⌕"
                : "✓"}
            </div>

            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NotificationPanel;