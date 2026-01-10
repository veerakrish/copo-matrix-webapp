// Hard-coded Program Outcomes, Competencies, and Performance Indicators
// This is the reference data structure for CSE program
// Updated to reflect new NBA structure: PO1-PO11 (old PO6 and PO7 merged into new PO6)

export const PO_DATA = {
  PO1: {
    title: "Engineering Knowledge",
    description: "Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization in computer science for the solution of complex engineering problems.",
    kLevel: 3, // Required K-level for this PO
    competencies: {
      "1.1": {
        description: "Demonstrate competence in mathematical modelling",
        performanceIndicators: {
          "1.1.1": "Apply mathematical techniques such as discrete mathematics, linear algebra, calculus, and statistics to solve computational and engineering problems",
          "1.1.2": "Apply advanced mathematical techniques including probability, queuing theory, and numerical methods to model computer engineering problems"
        }
      },
      "1.2": {
        description: "Demonstrate competence in basic sciences",
        performanceIndicators: {
          "1.2.1": "Apply laws of natural science and physics to engineering problems related to computing systems"
        }
      },
      "1.3": {
        description: "Demonstrate competence in engineering fundamentals",
        performanceIndicators: {
          "1.3.1": "Apply fundamental engineering concepts including digital logic, circuit design, and computer architecture"
        }
      },
      "1.4": {
        description: "Demonstrate competence in specialized engineering knowledge",
        performanceIndicators: {
          "1.4.1": "Apply computer science principles, programming paradigms, algorithms, and data structures",
          "1.4.2": "Apply domain-specific knowledge in software engineering, databases, and networking"
        }
      }
    }
  },
  PO2: {
    title: "Problem Analysis",
    description: "Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.",
    kLevel: 4,
    competencies: {
      "2.1": {
        description: "Demonstrate ability to identify and formulate complex engineering problems",
        performanceIndicators: {
          "2.1.1": "Articulate problem statements, identify objectives, and scope of computational problems",
          "2.1.2": "Identify computing systems, variables, parameters, constraints, and dependencies"
        }
      },
      "2.2": {
        description: "Demonstrate ability to formulate solution plan and methodology",
        performanceIndicators: {
          "2.2.1": "Reframe complex problems into interconnected sub-problems or modular components",
          "2.2.2": "Identify, assemble, and evaluate information, resources, and existing algorithms",
          "2.2.3": "Compare and contrast alternative computational approaches to select optimal methodology",
          "2.2.4": "Identify existing computational methods and design patterns"
        }
      },
      "2.3": {
        description: "Demonstrate ability to execute solution process and analyze results",
        performanceIndicators: {
          "2.3.1": "Apply computational methods and algorithms to solve mathematical and logical models",
          "2.3.2": "Produce and validate results using contemporary computing tools and testing frameworks",
          "2.3.3": "Identify sources of error, algorithm complexity, and solution limitations"
        }
      },
      "2.4": {
        description: "Demonstrate ability to validate problem solutions using research-based approaches",
        performanceIndicators: {
          "2.4.1": "Conduct literature reviews, compare existing solutions, and justify chosen approach"
        }
      }
    }
  },
  PO3: {
    title: "Design/Development of Solutions",
    description: "Design solutions for complex engineering problems and design system components or processes that meet specified needs with appropriate consideration for public health, safety, cultural, societal, and environmental considerations.",
    kLevel: 4,
    competencies: {
      "3.1": {
        description: "Demonstrate ability to define complex engineering problems",
        performanceIndicators: {
          "3.1.1": "Define open-ended computational problems, requirements specifications, and constraints",
          "3.1.2": "Identify stakeholder needs and translate them into technical requirements"
        }
      },
      "3.2": {
        description: "Demonstrate ability to generate diverse design solutions",
        performanceIndicators: {
          "3.2.1": "Apply formal design methodologies, architectural patterns, and design thinking",
          "3.2.2": "Build prototypes, code modules, or system designs to develop alternative solutions",
          "3.2.3": "Identify functional and non-functional criteria for evaluation"
        }
      },
      "3.3": {
        description: "Demonstrate ability to select optimal designs and advance implementations",
        performanceIndicators: {
          "3.3.1": "Evaluate designs using performance metrics, resource constraints, and cost-benefit analysis",
          "3.3.2": "Incorporate public safety, data security, privacy, ethical, and environmental considerations"
        }
      },
      "3.4": {
        description: "Apply responsible design principles including accessibility and inclusion",
        performanceIndicators: {
          "3.4.1": "Design systems considering diverse user needs and accessibility standards"
        }
      }
    }
  },
  PO4: {
    title: "Conduct Investigations of Complex Problems",
    description: "Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of information to provide valid conclusions.",
    kLevel: 4,
    competencies: {
      "4.1": {
        description: "Design and conduct experiments",
        performanceIndicators: {
          "4.1.1": "Design systematic experimental approaches with defined variables and success metrics",
          "4.1.2": "Establish hypothesis, design experimental variables, and define success metrics"
        }
      },
      "4.2": {
        description: "Collect and analyze data",
        performanceIndicators: {
          "4.2.1": "Execute experiments using appropriate tools and statistical methods"
        }
      },
      "4.3": {
        description: "Synthesize and interpret results",
        performanceIndicators: {
          "4.3.1": "Interpret results, synthesize findings, and identify limitations",
          "4.3.2": "Synthesize findings across multiple experiments and document research limitations"
        }
      }
    }
  },
  PO5: {
    title: "Modern Tool Usage",
    description: "Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of limitations.",
    kLevel: 3,
    competencies: {
      "5.1": {
        description: "Select appropriate tools",
        performanceIndicators: {
          "5.1.1": "Evaluate and select suitable programming languages, frameworks, and tools"
        }
      },
      "5.2": {
        description: "Apply tools effectively",
        performanceIndicators: {
          "5.2.1": "Apply modern IDEs, version control, collaborative tools, and simulation tools"
        }
      },
      "5.3": {
        description: "Understand tool limitations",
        performanceIndicators: {
          "5.3.1": "Understand limitations, scalability boundaries, and performance characteristics"
        }
      }
    }
  },
  PO6: {
    title: "The Engineer and The World",
    description: "Apply reasoning informed by contextual knowledge to analyze and evaluate societal, health, safety, legal, cultural and environmental aspects while solving complex engineering problems, and assess their impact on sustainability and professional responsibilities.",
    kLevel: 4, // Merged old PO6 and PO7 - requires higher cognitive level
    competencies: {
      "6.1": {
        description: "Assess societal, safety, legal contexts",
        performanceIndicators: {
          "6.1.1": "Identify societal impacts, health/safety implications, and relevant laws in computing"
        }
      },
      "6.2": {
        description: "Make ethical decisions",
        performanceIndicators: {
          "6.2.1": "Assess and mitigate risks related to privacy, data security, and user protection",
          "6.2.2": "Apply ethical reasoning and consider cultural contexts in design"
        }
      },
      "6.3": {
        description: "Assess and address digital divide and accessibility issues",
        performanceIndicators: {
          "6.3.1": "Evaluate impact of computing solutions on underrepresented populations"
        }
      },
      "6.4": {
        description: "Understand environmental impact",
        performanceIndicators: {
          "6.4.1": "Understand environmental impact of computing systems including energy consumption and e-waste"
        }
      },
      "6.5": {
        description: "Apply sustainable practices",
        performanceIndicators: {
          "6.5.1": "Apply green computing principles and evaluate lifecycle environmental impacts",
          "6.5.2": "Design systems promoting long-term sustainability and resource efficiency"
        }
      }
    }
  },
  PO7: {
    title: "Ethics",
    description: "Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.",
    kLevel: 3,
    competencies: {
      "7.1": {
        description: "Recognize ethical dilemmas",
        performanceIndicators: {
          "7.1.1": "Identify unethical conduct and propose ethical alternatives"
        }
      },
      "7.2": {
        description: "Apply professional ethics",
        performanceIndicators: {
          "7.2.1": "Apply professional codes of ethics (ACM, IEEE-CS, NASSCOM)",
          "7.2.2": "Examine and apply moral/ethical principles to real-world case studies"
        }
      }
    }
  },
  PO8: {
    title: "Individual and Team Work",
    description: "Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.",
    kLevel: 2,
    competencies: {
      "8.1": {
        description: "Work effectively individually",
        performanceIndicators: {
          "8.1.1": "Execute tasks with responsibility, initiative, and self-direction"
        }
      },
      "8.2": {
        description: "Function as team member",
        performanceIndicators: {
          "8.2.1": "Contribute to team goals, respect diverse perspectives, collaborate effectively"
        }
      },
      "8.3": {
        description: "Lead teams",
        performanceIndicators: {
          "8.3.1": "Guide teams toward objectives, facilitate group decision-making, manage conflict"
        }
      }
    }
  },
  PO9: {
    title: "Communication",
    description: "Communicate effectively on complex engineering activities with engineering community and society at large, comprehend and write reports, make presentations, give and receive clear instructions.",
    kLevel: 2,
    competencies: {
      "9.1": {
        description: "Comprehend and document",
        performanceIndicators: {
          "9.1.1": "Read, understand, interpret technical documentation and write clear reports"
        }
      },
      "9.2": {
        description: "Listen, speak, present",
        performanceIndicators: {
          "9.2.1": "Listen comprehensively and deliver effective presentations to diverse audiences"
        }
      },
      "9.3": {
        description: "Integrate communication modes",
        performanceIndicators: {
          "9.3.1": "Create diagrams, flowcharts, UML models and use multiple media effectively"
        }
      }
    }
  },
  PO10: {
    title: "Project Management and Finance",
    description: "Demonstrate knowledge and understanding of engineering and management principles and apply these to one's own work, as member and leader in team, to manage projects and in multidisciplinary environments.",
    kLevel: 3,
    competencies: {
      "10.1": {
        description: "Understand project management",
        performanceIndicators: {
          "10.1.1": "Understand project planning, scheduling, resource allocation, and risk management"
        }
      },
      "10.2": {
        description: "Apply PM in teams",
        performanceIndicators: {
          "10.2.1": "Plan project tasks, define milestones, establish timelines"
        }
      },
      "10.3": {
        description: "Manage engineering projects",
        performanceIndicators: {
          "10.3.1": "Apply quality management practices to ensure deliverables meet specifications",
          "10.3.2": "Manage documentation, version control, and conduct post-project reviews"
        }
      }
    }
  },
  PO11: {
    title: "Life Long Learning",
    description: "Recognize the need for, and have the preparation and ability for: (i) independent and life-long learning, and (ii) adaptability to new and emerging technologies in the broadest context of engineering practice.",
    kLevel: 3,
    competencies: {
      "11.1": {
        description: "Self-directed learning",
        performanceIndicators: {
          "11.1.1": "Identifies knowledge gaps and plans learning using MOOCs, documentation, and research papers beyond syllabus."
        }
      },
      "11.2": {
        description: "Adapting to emerging technologies",
        performanceIndicators: {
          "11.2.1": "Learns and applies new programming languages, frameworks, cloud/AI/quantum tools not explicitly covered in courses"
        }
      },
      "11.3": {
        description: "Continuous professional development",
        performanceIndicators: {
          "11.3.1": "Participates in hackathons, internships, certifications, or technical communities to keep skills current."
        }
      }
    }
  }
};

// Program Specific Outcomes (PSOs) for the department
export const PSO_DATA = {
  PSO1: {
    title: "Problem Solving and Programming Skills",
    description: "Ability to apply in depth problem solving and programming skills.",
    kLevel: 4, // Requires analysis and application
    competencies: {
      "PSO1.1": {
        description: "Apply problem solving skills",
        performanceIndicators: {
          "PSO1.1.1": "Analyze complex problems and break them down into solvable components",
          "PSO1.1.2": "Apply algorithmic thinking and data structures to solve problems",
          "PSO1.1.3": "Design efficient solutions using appropriate problem-solving strategies"
        }
      },
      "PSO1.2": {
        description: "Demonstrate programming proficiency",
        performanceIndicators: {
          "PSO1.2.1": "Write clean, efficient, and well-documented code",
          "PSO1.2.2": "Apply multiple programming paradigms and languages effectively",
          "PSO1.2.3": "Implement and optimize algorithms and data structures"
        }
      }
    }
  },
  PSO2: {
    title: "Collaborative Software Development",
    description: "Ability to do collaborative development of software solutions for Trans-disciplinary engineering problems.",
    kLevel: 4, // Requires analysis and synthesis
    competencies: {
      "PSO2.1": {
        description: "Work in collaborative teams",
        performanceIndicators: {
          "PSO2.1.1": "Participate effectively in team-based software development projects",
          "PSO2.1.2": "Use version control and collaborative development tools",
          "PSO2.1.3": "Communicate technical concepts to team members from different disciplines"
        }
      },
      "PSO2.2": {
        description: "Develop software solutions for trans-disciplinary problems",
        performanceIndicators: {
          "PSO2.2.1": "Identify software requirements in trans-disciplinary contexts",
          "PSO2.2.2": "Design software solutions that integrate knowledge from multiple engineering domains",
          "PSO2.2.3": "Implement solutions that address complex, multi-domain engineering challenges"
        }
      }
    }
  },
  PSO3: {
    title: "Hardware-Software Integration",
    description: "Ability to design an integrate hardware and software components for the advancement of technology.",
    kLevel: 5, // Requires evaluation and creation
    competencies: {
      "PSO3.1": {
        description: "Design hardware-software integrated systems",
        performanceIndicators: {
          "PSO3.1.1": "Design systems that integrate hardware and software components",
          "PSO3.1.2": "Understand hardware constraints and optimize software accordingly",
          "PSO3.1.3": "Create embedded systems and IoT solutions"
        }
      },
      "PSO3.2": {
        description: "Advance technology through integration",
        performanceIndicators: {
          "PSO3.2.1": "Evaluate and select appropriate hardware-software combinations",
          "PSO3.2.2": "Design innovative solutions that leverage hardware-software synergy",
          "PSO3.2.3": "Implement systems that advance technological capabilities"
        }
      }
    }
  }
};

export function getPOData() {
  return PO_DATA;
}

export function getPSOData() {
  return PSO_DATA;
}

// Helper function to get all PO numbers in numerical order (PO1, PO2, ..., PO11)
export function getPONumbers() {
  return Object.keys(PO_DATA).sort((a, b) => {
    // Extract numeric part from PO keys (e.g., "PO1" -> 1, "PO10" -> 10)
    const numA = parseInt(a.replace('PO', ''));
    const numB = parseInt(b.replace('PO', ''));
    return numA - numB;
  });
}

// Helper function to get all PSO numbers in numerical order (PSO1, PSO2, PSO3)
export function getPSONumbers() {
  return Object.keys(PSO_DATA).sort((a, b) => {
    // Extract numeric part from PSO keys (e.g., "PSO1" -> 1, "PSO2" -> 2)
    const numA = parseInt(a.replace('PSO', ''));
    const numB = parseInt(b.replace('PSO', ''));
    return numA - numB;
  });
}
