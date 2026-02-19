import React from "react";
import Loader from "./Loader";

const DashboardHeroStats = ({ schoolName, stats, onCardClick }) => {
  const visibleStats = stats.filter((item) => item.show);

  return (
    <section className="dashboard-hero mb-4">
      <div className="dashboard-hero-head mb-4">
        <p className="dashboard-hero-kicker mb-2">Dashboard</p>
        <h4 className="dashboard-hero-title mb-2">
          {schoolName || "School Panel"}
        </h4>
      </div>

      <div className="dashboard-stat-grid">
        {visibleStats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            className="dashboard-stat-card"
            onClick={() => onCardClick(stat.link)}
          >
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-label">{stat.label}</span>
              <span className="dashboard-stat-icon">
                <i className={`bi ${stat.icon}`}></i>
              </span>
            </div>
            <div className="dashboard-stat-value-wrap">
              {stat.loading ? (
                <Loader size="sm" />
              ) : (
                <span className="dashboard-stat-value">{stat.value}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DashboardHeroStats;
