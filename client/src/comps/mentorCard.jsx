import "../styles/MSsec.css";
export default function MentorCard({
  Photo,
  Name,
  Subsystem,
  "Hierarchal position": position,
  "Email ID": email,
  "LinkedIN ID": linkedin,
  "Instagram ID": instagram,
  Batch,
  CurrentStatus,
  Description,
}) {
  const defaultAvatar = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
    Name || "mentor",
  )}&backgroundColor=0b132b,111827,1e293b&color=f97316&radius=50`;
  const photoUrl = typeof Photo === "string" ? Photo.trim() : "";
  const driveFileId = photoUrl.match(/(?:drive\.google\.com|docs\.google\.com)\/(?:file\/d\/|uc\?.*?id=|open\?.*?id=|thumbnail\?.*?id=)([\w-]+)/)?.[1]
    || photoUrl.match(/[?&]id=([\w-]+)/)?.[1]
    || photoUrl.match(/\/d\/([\w-]+)/)?.[1];
  const avatarSrc = photoUrl
    ? (driveFileId ? `/media/drive/${encodeURIComponent(driveFileId)}` : photoUrl)
    : defaultAvatar;
  const emailLink = email ? `mailto:${email}` : null;
  const makeProfileUrl = (value, domain) => {
    if (!value?.trim()) return null;
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.includes(domain.split("/")[1]) || trimmed.startsWith("www.")) return `https://${trimmed}`;
    return `https://${domain}/${trimmed.replace(/^@/, "")}`;
  };
  const linkedinLink = makeProfileUrl(linkedin, "www.linkedin.com/in");
  const instagramLink = makeProfileUrl(instagram, "www.instagram.com");

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultAvatar;
  };

  return (
    <div className="mentorCard">
      <div className="mentorCard_avatar">
        <img
          src={avatarSrc}
          onError={handleImageError}
          alt={Name ? `${Name}'s profile picture` : "mentor profile picture"}
          className="mentorCard_image"
        />
      </div>

      <div className="mentorCard_body">
        <p className="mentorCard_name">{Name || "Mentor"}</p>
        <p className="mentorCard_sys">{Subsystem || "subsystem"}</p>
        <p className="mentorCard_des">{position || "Member"}</p>
        {Description && <p className="mentorCard_status">{Description}</p>}
        {Batch && <p className="mentorCard_batch">{Batch}</p>}
        {CurrentStatus && <p className="mentorCard_status">{CurrentStatus}</p>}
      </div>
    {/*email char code used*/}
      <div className="mentorCard_actions">
        {emailLink && (
          <a
            className="mentorCard_action mentorCard_action-email"
            href={emailLink}
            title={email}
            aria-label={`Email ${Name || "mentor"}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="mentorCard_action-icon">&#9993;</span> 
            Email
          </a>
        )}
        {linkedinLink && (
          <a
            className="mentorCard_action mentorCard_action-linkedin"
            href={linkedinLink}
            title={linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <span className="mentorCard_action-icon">in</span>
            LinkedIn
          </a>
        )}
        {instagramLink && (
          <a
            className="mentorCard_action mentorCard_action-instagram"
            href={instagramLink}
            title={instagram}
            aria-label={`Instagram profile for ${Name || "mentor"}`}
            target="_blank"
            rel="noreferrer"
          >
            <svg className="mentorCard_action-icon mentorCard_instagram-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}
