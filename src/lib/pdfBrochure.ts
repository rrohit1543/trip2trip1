import { Trip } from '../types';

export function generatePdfBrochure(trip: Trip) {
  // Generate downloadable HTML-based PDF document window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the PDF Package Brochure.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${trip.name} - Official Tour Brochure (TripMandi)</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000; padding: 40px; line-height: 1.5; }
          .header { border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 28px; font-weight: 900; }
          .brand span { color: #ef4444; }
          .badge { background: #ef4444; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
          .meta-item label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; }
          .meta-item font { font-size: 14px; font-weight: 800; }
          .section-title { font-size: 18px; font-weight: 800; border-left: 4px solid #ef4444; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; }
          .day-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 12px; background: #fff; }
          .day-title { font-weight: 800; font-size: 14px; margin-bottom: 5px; color: #0f172a; }
          .day-tag { background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
          ul { margin: 0; padding-left: 20px; font-size: 12px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; font-size: 12px; }
          .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; pt-20px; text-align: center; font-size: 11px; color: #64748b; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="brand">trip<span>2</span>trip</div>
            <div style="font-size: 12px; color: #64748b;">Verified B2B2C Group Tour Package Brochure</div>
          </div>
          <div class="badge">${trip.category} Tour</div>
        </div>

        <div class="title">${trip.name}</div>
        <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
          Operator: <strong>${trip.operatorName}</strong> &bull; Route: <strong>${trip.departureCity} &rarr; ${trip.destinationCity}</strong>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <label>Duration</label>
            <font>${trip.durationDays} Days / ${trip.durationNights} Nights</font>
          </div>
          <div class="meta-item">
            <label>Price Per Person</label>
            <font style="color: #dc2626;">₹${trip.pricePerPerson.toLocaleString('en-IN')}</font>
          </div>
          <div class="meta-item">
            <label>Vehicle Type</label>
            <font>${trip.vehicle.type}</font>
          </div>
          <div class="meta-item">
            <label>Difficulty</label>
            <font>${trip.difficultyLevel}</font>
          </div>
        </div>

        <div class="section-title">Day-Wise Tour Itinerary</div>
        ${trip.itinerary
          .map(
            (day) => `
          <div class="day-card">
            <span class="day-tag">DAY ${day.dayNumber}</span>
            <div class="day-title">${day.title}</div>
            <ul>
              ${day.activities.map((act) => `<li>${act}</li>`).join('')}
            </ul>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b;">
              Meals: <strong>${day.meals}</strong> &bull; Stay: <strong>${day.stayDetails}</strong>
            </div>
          </div>
        `
          )
          .join('')}

        <div class="grid-2" style="margin-top: 20px;">
          <div class="box">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 10px; color: #16a34a;">What's Included</div>
            <ul>
              ${trip.inclusions.map((inc) => `<li>${inc}</li>`).join('')}
            </ul>
          </div>

          <div class="box">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 10px; color: #dc2626;">What's Excluded</div>
            <ul>
              ${trip.exclusions.map((exc) => `<li>${exc}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="section-title">Hotel, Guide & Cancellation Info</div>
        <div class="box">
          <p style="margin: 0 0 5px 0;">Hotel: <strong>${trip.hotel.name}</strong> (${trip.hotel.stars}-Star)</p>
          <p style="margin: 0 0 5px 0;">Certified Guide: <strong>${trip.tourGuide.name}</strong> (${trip.tourGuide.phone})</p>
          <p style="margin: 0;">Cancellation Policy: <em>${trip.cancellationPolicy}</em></p>
        </div>

        <div class="footer">
          Generated automatically by <strong>TripMandi B2B2C Marketplace</strong> &bull; https://TripMandi.com
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
