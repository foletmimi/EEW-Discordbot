function shindo_class(scale) {
  switch (scale) {
    case 10:
      return "震度1";
    case 20:
      return "震度2";
    case 30:
      return "震度3";
    case 40:
      return "震度4";
    case 45:
      return "震度5弱";
    case 50:
      return "震度5強";
    case 55:
      return "震度6弱";
    case 60:
      return "震度6強";
    case 70:
      return "震度7";
    default:
      return "地震情報なし";
  }
}

function tsunami_class(info) {
  switch (info) {
    case "None":
      return "この地震による津波の心配はありません";
    case "Unknown":
      return "この地震による津波の発生は不明です";
    case "Checking":
      return "この地震による津波の発生は現在調査中です";
    case "NonEffective":
      return "この地震により若干の海面変動が予想されますが、被害の心配はありません";
    case "Watch":
      return "現在津波注意報が発令されています";
    case "Warning":
      return "現在津波警報が発令されています";
  }
}

module.exports = { tsunami_class, shindo_class };
