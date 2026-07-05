import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Cpu,
  Brain,
  Globe,
  Zap,
  MessageSquare,
  Settings,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  Activity,
  Radio,
  Save,
  LineChart,
  CheckSquare,
  RefreshCw
} from 'lucide-react';

// Workflow steps definition
interface WorkflowStep {
  id: number;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  details: string[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: "Data Ingestion",
    desc: "Real-time streaming of high-frequency vibration, thermal, and electrical telemetry from edge sensors.",
    icon: Database,
    details: ["Vibration telemetry at 10kHz", "CNC spindle temperature", "Motor current draw"]
  },
  {
    id: 2,
    title: "Edge AI Processing",
    desc: "Sub-10ms localized analysis on CNC controllers, filtering noise and computing edge features.",
    icon: Cpu,
    details: ["Fast Fourier Transform (FFT)", "Anomaly scoring at edge", "Air-gapped operation"]
  },
  {
    id: 3,
    title: "Machine Memory",
    desc: "Continuous episodic learning profiling vibration fingerprints and maintenance logs.",
    icon: Brain,
    details: ["153 learning cycles", "Historical repair memory", "Operator behavioral profile"]
  },
  {
    id: 4,
    title: "Industrial World Model",
    desc: "Physics-informed simulation predicting Remaining Useful Life and thermal failure chains.",
    icon: Globe,
    details: ["Causal stress chain simulation", "RUL forecast (+/- 2h accuracy)", "Thermal transfer mapping"]
  },
  {
    id: 5,
    title: "Decision Intelligence",
    desc: "Evaluating and ranking engineering trade-offs between downtime, safety, and energy.",
    icon: Zap,
    details: ["4 ranked options per alert", "Cost vs downtime optimization", "96% decision confidence"]
  },
  {
    id: 6,
    title: "Engineering Copilot",
    desc: "Natural language reasoning, explaining recommendations and answering operational queries.",
    icon: MessageSquare,
    details: ["Explainable AI outputs", "Root cause diagnostics", "Interactive operator chat"]
  },
  {
    id: 7,
    title: "Autonomous Action",
    desc: "Closed-loop feedback execution, automatically reducing parameters to prevent wear.",
    icon: Settings,
    details: ["Spindle speed optimization", "Adaptive feed override", "Immediate load relief"]
  },
  {
    id: 8,
    title: "Business Impact",
    desc: "Direct savings in machine uptime, reduced maintenance costs, and optimized carbon footprint.",
    icon: TrendingUp,
    details: ["₹21,400 savings per alert", "40% energy reduction", "99.2% predicted uptime"]
  }
];

// Learning Loop steps definition
interface LoopStep {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
}

const LOOP_STEPS: LoopStep[] = [
  { id: 1, title: "Machine Feedback", icon: Activity },
  { id: 2, title: "New Sensor Data", icon: Radio },
  { id: 3, title: "Machine Memory Updated", icon: Save },
  { id: 4, title: "World Model Improved", icon: LineChart },
  { id: 5, title: "Better Decisions", icon: CheckSquare },
  { id: 6, title: "Repeat", icon: RefreshCw }
];

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-play interval for the main workflow
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Auto-play interval for the continuous learning loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLoopStep((prev) => (prev + 1) % LOOP_STEPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Auto-center the active workflow card in horizontal scroll mode
  useEffect(() => {
    const activeCard = cardRefs.current[activeStep];
    const container = scrollContainerRef.current;
    
    if (activeCard && container) {
      const containerStyle = window.getComputedStyle(container);
      const isScrollable = containerStyle.overflowX === 'auto' || containerStyle.overflowX === 'scroll';
      
      // Only scroll if we are in horizontal scroll mode (viewport width < 1440px and >= 768px)
      if (isScrollable && window.innerWidth >= 768 && window.innerWidth < 1440) {
        const containerWidth = container.offsetWidth;
        const cardOffsetLeft = activeCard.offsetLeft;
        const cardWidth = activeCard.offsetWidth;
        
        container.scrollTo({
          left: cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeStep]);

  const handleCardClick = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false); // Pause auto-play on user interaction
  };

  return (
    <div className="tw-bg-white tw-text-black tw-py-24 tw-px-6 tw-w-full tw-font-sans tw-border-t tw-border-b tw-border-border">
      <div className="tw-max-w-7xl tw-mx-auto">
        
        {/* HEADER SECTION - Clean enterprise SaaS styling */}
        <div className="tw-mb-16 tw-flex tw-flex-col md:tw-flex-row md:tw-items-end md:tw-justify-between">
          <div className="tw-max-w-2xl">
            <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-gray-400 tw-block tw-mb-3">
              Operational Sequence
            </span>
            <h2 className="tw-text-3xl md:tw-text-4xl tw-font-semibold tw-tracking-tight tw-mb-4">
              ForgeMind AI — Approach &amp; Workflow
            </h2>
            <p className="tw-text-sm md:tw-text-base tw-text-gray-500 tw-leading-relaxed">
              Our cognitive edge architecture closes the loop between physical telemetry and autonomous mitigation, processing inputs in sub-10ms intervals.
            </p>
          </div>
          
          {/* Active indicator controls */}
          <div className="tw-mt-6 md:tw-mt-0 tw-flex tw-items-center tw-gap-4 tw-flex-shrink-0">
            <div className="tw-flex tw-items-center tw-gap-2">
              <span className="tw-text-xs tw-text-gray-400 tw-font-medium">Auto-play</span>
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`tw-w-8 tw-h-5 tw-rounded-full tw-transition-colors tw-duration-300 tw-flex tw-items-center tw-px-0.5 ${isAutoPlaying ? 'tw-bg-black' : 'tw-bg-gray-200'}`}
              >
                <div className={`tw-w-4 tw-h-4 tw-rounded-full tw-bg-white tw-transition-transform tw-duration-300 ${isAutoPlaying ? 'tw-transform tw-translate-x-3' : ''}`} />
              </button>
            </div>
            <div className="tw-text-xs tw-text-gray-400 tw-font-mono">
              Step {activeStep + 1} of {WORKFLOW_STEPS.length}
            </div>
          </div>
        </div>

        {/* TIMELINE PROGRESS INDICATOR */}
        <div className="tw-hidden md:tw-block tw-w-full tw-h-[2px] tw-bg-gray-100 tw-mb-12 tw-relative">
          <motion.div 
            className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-bg-black"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / WORKFLOW_STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* WORKFLOW CARDS CONTAINER */}
        {/* 
          Responsive Breakpoints Configured:
          - Mobile (<768px): Stack vertically. Cards are full width. Vertical connector arrows.
          - Laptop/Tablet (768px to 1440px): Horizontal carousel. Cards maintain fixed width (280px). Scroll-snap enabled.
          - Large Desktop (>=1440px): Single-row, 8-column layout. No scroll.
        */}
        <div 
          ref={scrollContainerRef}
          className="no-scrollbar tw-flex tw-flex-col md:tw-flex-row md:tw-overflow-x-auto md:tw-snap-x md:tw-snap-mandatory min-[1440px]:tw-grid min-[1440px]:tw-grid-cols-8 tw-gap-10 md:tw-gap-12 min-[1440px]:tw-gap-4 tw-pb-8"
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === activeStep;
            
            return (
              <div
                key={step.id}
                ref={el => cardRefs.current[index] = el}
                onClick={() => handleCardClick(index)}
                className="tw-relative tw-flex-shrink-0 tw-w-full md:tw-w-[280px] min-[1440px]:tw-w-auto tw-snap-center"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.02 : 1.0,
                    borderColor: isActive ? "#000000" : "#E5E7EB",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`tw-bg-white tw-border tw-rounded-xl tw-p-6 tw-h-[280px] tw-flex tw-flex-col tw-justify-between tw-transition-all tw-duration-300 hover:tw-border-black ${
                    isActive ? 'tw-shadow-sm' : 'hover:tw-shadow-sm'
                  }`}
                >
                  <div>
                    {/* Icon and Index label */}
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <div className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-transition-colors ${
                        isActive ? 'tw-bg-black tw-text-white' : 'tw-bg-gray-50 tw-text-gray-600'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      
                      <span className="tw-text-xs tw-font-mono tw-text-gray-300">0{step.id}</span>
                    </div>

                    {/* Content */}
                    <h3 className="tw-text-sm tw-font-semibold tw-text-black tw-mb-2">
                      {step.title}
                    </h3>
                    <p className="tw-text-xs tw-text-gray-400 tw-leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  
                  {/* Technical detail snippet */}
                  <div className="tw-mt-4 tw-pt-3 tw-border-t tw-border-gray-50">
                    <span className="tw-text-[10px] tw-font-mono tw-text-gray-400 tw-block tw-truncate">
                      {step.details[0]}
                    </span>
                  </div>
                </motion.div>
                
                {/* Visual indicator arrows */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <>
                    {/* Horizontal Connector Arrow (Visible on tablet, laptop, and desktop) */}
                    <div className="tw-hidden md:tw-flex tw-absolute tw-top-1/2 tw-right-0 tw-translate-x-full tw-w-12 tw-z-10 tw-items-center tw-justify-center">
                      <ArrowRight size={14} className="tw-text-gray-300 animate-pulse" />
                    </div>
                    
                    {/* Vertical Connector Arrow (Visible on mobile) */}
                    <div className="tw-flex md:tw-hidden tw-absolute tw-bottom-0 tw-left-1/2 tw-translate-x-[-50%] tw-translate-y-full tw-h-10 tw-z-10 tw-items-center tw-justify-center">
                      <ArrowDown size={14} className="tw-text-gray-300 animate-pulse" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ACTIVE CARD EXPANDED DETAILS */}
        <div className="tw-mt-8 tw-mb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="tw-bg-gray-50 tw-border tw-border-border tw-rounded-xl tw-p-6 md:tw-p-8"
            >
              <div className="tw-grid md:tw-grid-cols-3 tw-gap-6 tw-items-center">
                <div className="md:tw-col-span-1">
                  <span className="tw-text-xs tw-font-mono tw-text-gray-400">Step 0{activeStep + 1} — Deep Dive</span>
                  <h4 className="tw-text-lg tw-font-semibold tw-text-black tw-mt-1 tw-mb-2">
                    {WORKFLOW_STEPS[activeStep].title}
                  </h4>
                  <p className="tw-text-xs tw-text-gray-500">
                    Active operational node inside the ForgeMind localized feedback loops.
                  </p>
                </div>
                
                <div className="md:tw-col-span-2">
                  <div className="tw-grid sm:tw-grid-cols-3 tw-gap-4">
                    {WORKFLOW_STEPS[activeStep].details.map((detail, dIdx) => (
                      <div key={dIdx} className="tw-bg-white tw-border tw-border-border tw-rounded-lg tw-p-4">
                        <span className="tw-text-xs tw-font-mono tw-text-gray-400 tw-block tw-mb-1">Telemetry / Spec</span>
                        <p className="tw-text-xs tw-font-medium tw-text-black">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CONTINUOUS LEARNING LOOP - Always visible below the main workflow */}
        <div className="tw-border-t tw-border-border tw-pt-20">
          <div className="tw-mb-12 tw-text-center">
            <span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-text-gray-400 tw-block tw-mb-3">
              Adaptive Feedback Loop
            </span>
            <h3 className="tw-text-2xl tw-font-semibold tw-tracking-tight tw-text-black">
              Continuous Learning Lifecycle
            </h3>
            <p className="tw-text-xs tw-text-gray-500 tw-max-w-md tw-mx-auto tw-mt-2">
              How the platform iteratively enhances its world representations and decision matrices based on executed actions.
            </p>
          </div>

          {/* Learning Loop Display - Fully Responsive layout with arrows */}
          <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-justify-between tw-gap-12 md:tw-gap-4 tw-max-w-5xl tw-mx-auto">
            {LOOP_STEPS.map((step, index) => {
              const LoopIcon = step.icon;
              const isLoopActive = index === activeLoopStep;
              
              return (
                <div key={step.id} className="tw-relative tw-flex tw-flex-col tw-items-center tw-flex-1">
                  <motion.div
                    animate={{
                      scale: isLoopActive ? 1.05 : 1.0,
                      borderColor: isLoopActive ? "#000000" : "#E5E7EB",
                      backgroundColor: isLoopActive ? "#000000" : "#FFFFFF",
                      color: isLoopActive ? "#FFFFFF" : "#000000"
                    }}
                    transition={{ duration: 0.3 }}
                    className="tw-w-16 tw-h-16 tw-rounded-xl tw-border tw-flex tw-items-center tw-justify-center tw-mb-3 tw-shadow-sm"
                  >
                    <LoopIcon size={24} />
                  </motion.div>
                  
                  <span className={`tw-text-center tw-text-xs tw-font-medium tw-max-w-[120px] tw-transition-colors ${
                    isLoopActive ? 'tw-text-black tw-font-semibold' : 'tw-text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  
                  {/* Arrow connectors for learning loop */}
                  {index < LOOP_STEPS.length - 1 && (
                    <>
                      {/* Horizontal Arrow (visible on tablet/desktop: md and up) */}
                      <div className="tw-hidden md:tw-flex tw-absolute tw-top-8 tw-right-0 tw-translate-x-1/2 tw-z-10 tw-w-8 tw-items-center tw-justify-center">
                        <ArrowRight size={14} className="tw-text-gray-300 animate-pulse" />
                      </div>
                      
                      {/* Vertical Arrow (visible on mobile: below md) */}
                      <div className="tw-flex md:tw-hidden tw-absolute tw-bottom-0 tw-left-1/2 tw-translate-x-[-50%] tw-translate-y-full tw-h-12 tw-z-10 tw-items-center tw-justify-center">
                        <ArrowDown size={14} className="tw-text-gray-300 animate-pulse" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
