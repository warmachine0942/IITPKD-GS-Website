import { AntennaIcon, CpuIcon, FlameIcon, FlaskIcon, UmbrellaIcon, WrenchIcon } from '../comps/SubsystemIcons';

export const subsystems = [
  {
    id: "avionics",
    title: "Avionics",
    desc: "Flight computers, telemetry, and sensor integration. The brain of the rocket.",
    icon: <CpuIcon />
  },
  {
    id: "airframe",
    title: "Airframe",
    desc: "Designing and building the rocket’s structure for strength, stability, and flight performance.",
    icon: <WrenchIcon />
  },
  {
    id: "recovery",
    title: "Recovery",
    desc: "Developing reliable parachute deployment and recovery systems for a safe return after flight.",
    icon: <UmbrellaIcon />
  },
  {
    id: "payload",
    title: "Payload",
    desc: "Integrating scientific payloads and onboard experiments to collect useful flight data.",
    icon: <FlaskIcon />
  },
  {
    id: "ground-station",
    title: "Ground Station",
    desc: "Connecting the launch team to the rocket through telemetry, tracking, and live flight data.",
    icon: <AntennaIcon />
  },
  {
    id: "propulsion",
    title: "Propulsion",
    desc: "Designing and testing propulsion systems to deliver reliable thrust throughout the flight.",
    icon: <FlameIcon />
  }
];
