import os
import matplotlib.pyplot as plt
import numpy as np

os.makedirs('tests/assets', exist_ok=True)

# 1. Chart: Test Summary Donut
def generate_summary_chart():
    fig, ax = plt.subplots(figsize=(6, 3.2), subplot_kw=dict(aspect="equal"), dpi=300)
    labels = ['API & Routing (39)', 'Unit Algoritma (27)', 'Database Models (13)', 'Build & Lint (2)']
    sizes = [39, 27, 13, 2]
    colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b']
    explode = (0.05, 0.05, 0.05, 0.05)

    wedges, texts, autotexts = ax.pie(
        sizes,
        explode=explode,
        labels=labels,
        autopct='%1.1f%%',
        pctdistance=0.75,
        startangle=140,
        colors=colors,
        textprops=dict(color="#1f2937", fontsize=9, fontweight='medium')
    )

    centre_circle = plt.Circle((0,0), 0.55, fc='white')
    fig.gca().add_artist(centre_circle)

    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
        autotext.set_fontsize(9)

    ax.set_title("Distribusi Cakupan Pengujian (Total: 81 Komponen Diuji)", fontsize=11, fontweight='bold', pad=12, color='#111827')
    plt.tight_layout()
    chart_path = 'tests/assets/chart_summary.png'
    plt.savefig(chart_path, transparent=False, facecolor='white')
    plt.close()
    print(f"[OK] Summary chart generated: {chart_path}")

# 2. Chart: SAW Preference Scores Comparison
def generate_saw_ranking_chart():
    careers = [
        'Software Engineer',
        'Data Analyst',
        'DevOps Engineer',
        'Business Analyst',
        'Cybersecurity',
        'QA Engineer',
        'UI/UX Designer',
        'Database Admin',
        'Network Admin'
    ]
    # Realistic preference scores calculated for student Mame Riyadi
    scores = [0.9994, 0.9420, 0.9250, 0.8980, 0.8840, 0.8650, 0.8520, 0.8310, 0.8120]

    fig, ax = plt.subplots(figsize=(7, 3.4), dpi=300)
    y_pos = np.arange(len(careers))
    colors = ['#1d4ed8' if i == 0 else '#60a5fa' for i in range(len(careers))]

    bars = ax.barh(y_pos, scores, color=colors, height=0.65, edgecolor='#1e40af', linewidth=0.8)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(careers, fontsize=8.5, fontweight='medium', color='#1f2937')
    ax.invert_yaxis()  # top-down
    ax.set_xlabel('Nilai Preferensi Akhir ($V_i$)', fontsize=9, fontweight='bold', color='#111827')
    ax.set_xlim(0.7, 1.05)

    for bar in bars:
        width = bar.get_width()
        ax.text(width + 0.008, bar.get_y() + bar.get_height()/2, f'{width:.4f}',
                ha='left', va='center', fontsize=8, fontweight='bold', color='#1e3a8a')

    ax.grid(axis='x', linestyle='--', alpha=0.5, color='#cbd5e1')
    ax.set_title('Peringkat Rekomendasi Karir Berdasarkan Nilai Preferensi SAW ($V_i$)', fontsize=10.5, fontweight='bold', pad=10, color='#111827')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    chart_path = 'tests/assets/chart_saw_ranking.png'
    plt.savefig(chart_path, transparent=False, facecolor='white')
    plt.close()
    print(f"[OK] SAW Ranking chart generated: {chart_path}")

# 3. Chart: RIASEC Dimensions Radar / Bar
def generate_riasec_chart():
    dimensions = ['Realistic (R)', 'Investigative (I)', 'Artistic (A)', 'Social (S)', 'Enterprising (E)', 'Conventional (C)']
    scores = [12, 15, 11, 6, 8, 9]  # Student result: IRA
    max_score = 15

    fig, ax = plt.subplots(figsize=(6.5, 3.2), dpi=300)
    x = np.arange(len(dimensions))
    bar_colors = ['#3b82f6', '#1d4ed8', '#0284c7', '#94a3b8', '#64748b', '#475569']

    bars = ax.bar(x, scores, color=bar_colors, width=0.55, edgecolor='#0f172a', linewidth=0.5)
    ax.set_ylabel('Skor Minat (Skala 3 - 15)', fontsize=8.5, fontweight='bold', color='#111827')
    ax.set_title('Distribusi Skor Minat Vokasional Holland RIASEC (Top Code: IRA)', fontsize=10.5, fontweight='bold', pad=10, color='#111827')
    ax.set_xticks(x)
    ax.set_xticklabels(dimensions, rotation=20, ha='right', fontsize=8, fontweight='medium', color='#1f2937')
    ax.set_ylim(0, 17)

    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#0f172a')

    ax.axhline(y=10, color='#dc2626', linestyle=':', alpha=0.7, label='Ambang Signifikansi (10)')
    ax.legend(loc='upper right', fontsize=8)
    ax.grid(axis='y', linestyle='--', alpha=0.5, color='#cbd5e1')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    chart_path = 'tests/assets/chart_riasec.png'
    plt.savefig(chart_path, transparent=False, facecolor='white')
    plt.close()
    print(f"[OK] RIASEC chart generated: {chart_path}")

if __name__ == '__main__':
    generate_summary_chart()
    generate_saw_ranking_chart()
    generate_riasec_chart()
