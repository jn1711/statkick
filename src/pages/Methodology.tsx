import { Link } from "react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Calculator,
  Battery,
  Target,
  Dice1,
  ArrowRightLeft,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Двухфакторная модель Пуассона",
    icon: Calculator,
    color: "#00E701",
    content:
      "Модель Пуассона используется для прогнозирования точного счёта матча. Вероятность k голов рассчитывается по формуле:",
    formula: "P(k) = (\u03bb\u207F \u00b7 e\u02e3\u2097) / k!",
    details: [
      "\u03bb \u2014 среднее ожидаемое количество голов, рассчитываемое на основе атакующей силы команды А и оборонительной слабости команды Б",
      "k \u2014 количество голов",
      "Фактор домашнего поля добавляет +0.25 к \u03bb хозяев",
      "Модель учитывает исторические xG команды за последние 5 матчей",
    ],
  },
  {
    title: "Индекс усталости (Fatigue Index)",
    icon: Battery,
    color: "#F59E0B",
    content:
      "Индекс усталости корректирует базовые параметры \u03bb перед матчем:",
    formula: "FI = w\u2081 \u00b7 D + w\u2082 \u00b7 T",
    details: [
      "D \u2014 штраф за короткий интервал между матчами (< 4 дней)",
      "T \u2014 суммарное полётное расстояние за последние 14 суток (в тыс. км)",
      "w\u2081 = 0.6, w\u2082 = 0.4 \u2014 весовые коэффициенты",
      "Экспоненциальный штраф при отдыхе < 4 дней",
      "FI \u2208 [0, 1], где 0 \u2014 идеальная форма, 1 \u2014 критическая усталость",
    ],
  },
  {
    title: "Модель ожидаемых голов (xG)",
    icon: Target,
    color: "#3B82F6",
    content:
      "Expected Goals (xG) \u2014 метрика, измеряющая качество ударов по воротам:",
    formula: "xG = \u03a3 P(\u0433\u043e\u043b | \u0443\u0441\u043b\u043e\u0432\u0438\u044f \u0443\u0434\u0430\u0440\u0430)",
    details: [
      "Учитывает позицию удара, тип завершения, передачу",
      "25+ параметров на каждый удар",
      "xG > 1.5 считается высоким показателем",
      "xGA (ожидаемые пропущенные) \u2014 оборонительная метрика",
      "xA (ожидаемые передачи) \u2014 креативная метрика",
    ],
  },
  {
    title: "Симуляция Монте-Карло",
    icon: Dice1,
    color: "#A855F7",
    content:
      "Для прогнозирования итоговой таблицы чемпионата:",
    formula: "P(\u0438\u0441\u0445\u043e\u0434) = N(\u0438\u0441\u0445\u043e\u0434) / N(\u0438\u0442\u0435\u0440\u0430\u0446\u0438\u0439)",
    details: [
      "10,000 итераций розыгрыша оставшихся матчей сезона",
      "Каждый матч моделируется с помощью распределения Пуассона",
      "Результат определяется по вероятностям P1 / X / P2",
      "Итоговые вероятности = частота исхода по всем итерациям",
      "Точность модели калибруется на исторических данных",
    ],
  },
  {
    title: "Трансферный симулятор",
    icon: ArrowRightLeft,
    color: "#EF4444",
    content:
      "Оценка влияния игрока на командный потенциал:",
    formula: "\u0394xG = xG(\u0438\u0433\u0440\u043e\u043a) \u00b7 \u03b1 - xG(\u0441\u0442\u0430\u0440\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u044b) \u00b7 \u03b2",
    details: [
      "\u03b1 = 0.8 \u2014 коэффициент адаптации к новой команде",
      "\u03b2 = 1.0 \u2014 вклад в старой команде (полный)",
      "Расчёт доли вклада игрока в командные xG и xA",
      "Учёт позиционной совместимости",
      "Прогноз влияния на исходы матчей",
    ],
  },
];

export default function Methodology() {
  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#00E701]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Описание методологии
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm max-w-2xl">
            Математическое обоснование работы платформы StatKick. Ниже приведены
            формулы и алгоритмы, используемые для прогнозирования футбольных матчей.
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden mb-12"
        >
          <img
            src="/xg-heatmap.jpg"
            alt="xG Analytics Visualization"
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030B15] via-[#030B15]/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-lg font-semibold">
              Big Data + Математические модели = Точные прогнозы
            </p>
            <p className="text-[#9CA3AF] text-sm mt-1">
              Комбинация статистического анализа и машинного обучения
            </p>
          </div>
        </motion.div>

        {/* Methodology Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-dark rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <section.icon
                    className="w-6 h-6"
                    style={{ color: section.color }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-[#9CA3AF] mb-4">{section.content}</p>

                  {/* Formula */}
                  <div
                    className="rounded-lg p-4 mb-4 font-mono-data text-sm"
                    style={{
                      backgroundColor: `${section.color}08`,
                      border: `1px solid ${section.color}20`,
                    }}
                  >
                    <span style={{ color: section.color }}>{section.formula}</span>
                  </div>

                  {/* Details */}
                  <ul className="space-y-2">
                    {section.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#9CA3AF]">
                        <CheckCircle
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: section.color }}
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-dark rounded-xl p-6 sm:p-8 mt-8 gradient-border-green"
        >
          <h2 className="text-lg font-bold text-white mb-4">
            Точность моделей
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00E701] font-mono-data mb-1">
                68%
              </p>
              <p className="text-sm text-[#9CA3AF]">Точность исхода матча</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#3B82F6] font-mono-data mb-1">
                42%
              </p>
              <p className="text-sm text-[#9CA3AF]">Точность счёта ±1</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#A855F7] font-mono-data mb-1">
                89%
              </p>
              <p className="text-sm text-[#9CA3AF]">Точность топ-4 лиги</p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
