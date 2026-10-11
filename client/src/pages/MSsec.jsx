import { useState, useEffect } from "react";
import axios from "axios";
import MentorCard from "../comps/mentorCard";
import SponsorCard from "../comps/sponsorCard";
import "../styles/MSsec.css";

export default function MSsec({ sponsors }) {
  const [currentView, setCurrentView] = useState("faculty");
  const [mentorList, setMentorList] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: "faculty", label: "Faculty Advisors" },
    { id: "leads", label: "Team Leads" },
    { id: "propulsion", label: "Propulsion" },
    { id: "ground-station", label: "Ground Station" },
    { id: "avionics", label: "Avionics" },
    { id: "airframe-recovery", label: "Airframe & Recovery" },
    { id: "payload", label: "Payload" },
    { id: "alumni", label: "Alumni & Legacy" }, // Renamed from "Alumni"
    { id: "sponsors", label: "Sponsors" },
  ];

  // Utility checking functions
  const isLegacyMember = (member) => {
    const pos = (member["Hierarchal position"] || "").toLowerCase();
    return pos.includes("23") || pos.includes("legacy");
  };

  const isFacultyMember = (member) => {
    const sub = (member.Subsystem || "").toLowerCase();
    const pos = (member["Hierarchal position"] || "").toLowerCase();
    return (
      sub.includes("faculty") ||
      sub.includes("advisor") ||
      pos.includes("faculty") ||
      pos.includes("advisor")
    );
  };

  const normalizeMember = (member) => ({
    ...member,
    Name: member.Name || member.name || member.fullName,
    Subsystem: member.Subsystem || member.subsystem,
    "Hierarchal position": member["Hierarchal position"] || member["Hierarchical Position"] || member.position || member.role,
    "Email ID": member["Email ID"] || member.Email || member.email,
    "LinkedIN ID": member["LinkedIN ID"] || member.linkedin || member.linkedIn,
    "Instagram ID": member["Instagram ID"] || member.Instagram || member.instagram,
    Photo: member.Photo || member.photo || member.image,
    Description: member.Description || member.description || member.bio || member.currentEmployer,
    Batch: member.Batch || member.batch || member["Batch and Branch"] || member.batchAndBranch,
  });

  const roleRank = (position = "") => {
    const role = position.toLowerCase();
    if (role.includes("subsystem") && role.includes("lead")) return 1;
    if (role.includes("team lead") || role === "lead" || role.includes("teamlead")) return 0;
    if (role.includes("student mentor") || role.includes("mentor")) return 2;
    if (role.includes("apprentice")) return 4;
    if (role.includes("member")) return 3;
    if (role.includes("lead")) return 0;
    return 5;
  };

  const roleGroup = (member) => {
    if (isFacultyMember(member)) return "Faculty Advisors";
    switch (roleRank(member["Hierarchal position"])) {
      case 0: return "Team Leads";
      case 1: return "Subsystem Leads";
      case 2: return "Student Mentors";
      case 3: return "Members";
      case 4: return "Apprentices";
      default: return "Other Team Members";
    }
  };

  const sortByHierarchy = (people) => [...people].sort((a, b) =>
    roleRank(a["Hierarchal position"]) - roleRank(b["Hierarchal position"]) ||
    (a.Name || "").localeCompare(b.Name || ""),
  );

  const formatBatch = (batch = "") => {
    const value = String(batch);
    const year = value.match(/20\d{2}/)?.[0];
    if (year) return `Batch ${year}`;
    const shortYear = value.match(/(?:batch\s*)?([12]\d)\b/i)?.[1];
    if (shortYear) return `Batch 20${shortYear}`;
    return value.trim() || "Batch not specified";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both members and alumni concurrently
        const [memberRes, alumniRes] = await Promise.allSettled([
          axios.get("/member"),
          axios.get("/alumni"),
        ]);

        let hasFaculty = false;
        let membersData = [];

        if (memberRes.status === "fulfilled") {
          membersData = (Array.isArray(memberRes.value.data) ? memberRes.value.data : []).map(normalizeMember);
          setMentorList(membersData);

          // Check if there are any current Faculty Advisors in the database
          hasFaculty = membersData.some(
            (member) => isFacultyMember(member) && !isLegacyMember(member)
          );
        } else {
          console.error("Error fetching members:", memberRes.reason);
        }

        if (alumniRes.status === "fulfilled") {
          setAlumniList((Array.isArray(alumniRes.value.data) ? alumniRes.value.data : []).map(normalizeMember));
        } else {
          console.error("Error fetching alumni:", alumniRes.reason);
        }

        if (memberRes.status === "rejected" && alumniRes.status === "rejected") {
          setError("Could not connect to the team database. Please try again later.");
        }

        // UX Optimization: If no active faculty advisors exist, default to "leads"
        if (!hasFaculty && membersData.length > 0) {
          setCurrentView("leads");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredMembers = () => {
    switch (currentView) {
      case "faculty":
        return mentorList.filter(
          (member) => isFacultyMember(member) && !isLegacyMember(member)
        );

      case "leads":
        return mentorList.filter(
          (member) =>
            (member["Hierarchal position"] || "").toLowerCase().includes("lead") &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
        );

      case "propulsion":
        return mentorList.filter(
          (member) =>
            (member.Subsystem || "").toLowerCase() === "propulsion" &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
        );

      case "ground-station":
        return mentorList.filter((member) => {
          const sub = (member.Subsystem || "").toLowerCase();
          return (
            (sub === "ground station" || sub === "ground-station") &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
          );
        });

      case "avionics":
        return mentorList.filter(
          (member) =>
            (member.Subsystem || "").toLowerCase() === "avionics" &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
        );

      case "airframe-recovery":
        return mentorList.filter((member) => {
          const sub = (member.Subsystem || "").toLowerCase();
          return (
            (sub === "air frame" || sub === "airframe" || sub === "recovery") &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
          );
        });

      case "payload":
        return mentorList.filter(
          (member) =>
            (member.Subsystem || "").toLowerCase() === "payload" &&
            !isFacultyMember(member) &&
            !isLegacyMember(member)
        );

      default:
        return [];
    }
  };

  const getLegacyAndAlumniList = () => {
    const mappedAlumni = alumniList.map((alumnus) => ({
      _id: alumnus._id,
      Photo: alumnus.Photo || alumnus.photo || alumnus.image,
      Name: alumnus.Name,
      Subsystem: alumnus.Subsystem,
      "Hierarchal position": alumnus["Hierarchical Position"] || alumnus["Hierarchal position"] || alumnus.position || "Alumni",
      "Email ID": alumnus.Email || alumnus.email,
      "LinkedIN ID": alumnus["LinkedIN ID"] || alumnus.linkedin || alumnus.linkedIn,
      "Instagram ID": alumnus["Instagram ID"] || alumnus.Instagram || alumnus.instagram,
      Batch: formatBatch(alumnus.Batch || alumnus.batch || alumnus["Batch and Branch"] || alumnus.batchAndBranch),
      CurrentStatus: alumnus["Current Education/Job "] || alumnus.currentEducationJob || alumnus.currentEmployer,
      Description: alumnus.Description || alumnus.description || alumnus.bio,
    }));

    const mappedLegacy = mentorList
      .filter(isLegacyMember)
      .map((member) => ({
        _id: member._id,
        Photo: member.Photo || member.photo || member.image,
        Name: member.Name,
        Subsystem: member.Subsystem,
        "Hierarchal position": member["Hierarchal position"],
        "Email ID": member["Email ID"],
        "LinkedIN ID": member["LinkedIN ID"],
        "Instagram ID": member["Instagram ID"],
      }));

    return [...mappedLegacy, ...mappedAlumni];
  };

  const filteredMembers = sortByHierarchy(getFilteredMembers());
  const memberGroups = filteredMembers.reduce((groups, member) => {
    const label = roleGroup(member);
    (groups[label] ||= []).push(member);
    return groups;
  }, {});
  const orderedMemberGroups = Object.entries(memberGroups).sort(([, peopleA], [, peopleB]) =>
    roleRank(peopleA[0]?.["Hierarchal position"]) - roleRank(peopleB[0]?.["Hierarchal position"]),
  );
  const legacyAndAlumniList = getLegacyAndAlumniList();
  const legacyPeople = legacyAndAlumniList.filter((person) =>
    mentorList.some((member) => member._id === person._id && isLegacyMember(member)),
  );
  const alumniGroups = legacyAndAlumniList
    .filter((person) => !legacyPeople.includes(person))
    .reduce((groups, person) => {
      const batch = person.Batch || "Batch not specified";
      (groups[batch] ||= []).push(person);
      return groups;
    }, {});
  const orderedAlumniGroups = Object.entries(alumniGroups).sort(([batchA], [batchB]) =>
    batchA.localeCompare(batchB, undefined, { numeric: true }),
  );

  return (
    <div className="MSsec page-transition">
      <div className="toggle-btn-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`view-toggle-btn ${currentView === tab.id ? "active" : "inactive"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="status-message">Loading details...</p>}
      {error && <p className="status-message error">Failed to load: {error}</p>}

      {!loading && !error && (
        <div className="tab-content-wrapper">
          {currentView === "sponsors" ? (
            <SponsorCard sponsors={sponsors} />
          ) : currentView === "alumni" ? (
            legacyAndAlumniList.length === 0 ? (
              <p className="status-message">No records found.</p>
            ) : (
              <div className="alumni-groups">
                {orderedAlumniGroups.map(([batch, people]) => (
                  <section className="alumni-group" key={batch}>
                    <h2>{batch}</h2>
                    <ul>{people.map((person) => (
                      <li key={person._id}>
                        <MentorCard {...person} />
                      </li>
                    ))}</ul>
                  </section>
                ))}
                {legacyPeople.length > 0 && (
                  <section className="alumni-group">
                    <h2>Legacy Team</h2>
                    <ul>{sortByHierarchy(legacyPeople).map((person) => (
                      <li key={person._id}><MentorCard {...person} /></li>
                    ))}</ul>
                  </section>
                )}
              </div>
            )
          ) : filteredMembers.length === 0 ? (
            <p className="status-message">No members found in this category.</p>
          ) : (
            <div className="team-role-groups">
              {orderedMemberGroups.map(([label, people]) => (
                <section className="team-role-group" key={label}>
                  <h2>{label}</h2>
                  <ul>{people.map((member) => (
                    <li key={member._id}><MentorCard {...member} /></li>
                  ))}</ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
