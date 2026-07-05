/**
 * 1. Checks and returns already paired devices on client startup.
 * @returns {Promise<USBDevice[]>} Array of paired USB devices
 */
export async function initUsbPrinter() {
	if (typeof window !== 'undefined' && navigator.usb) {
		return await refreshPairedPrinters();
	}
	return [];
}

/**
 * 2. Requests explicit permission from the user for a printer and claims the interface.
 * @returns {Promise<USBDevice|null>} The configured/claimed USB device, or null if failed
 */
export async function requestUsbPrinter() {
	try {
		// Request device permission (classCode 7 targets printers)
		const device = await navigator.usb.requestDevice({
			filters: [{ classCode: 7 }]
		});

		console.log(`✅ Printer selected: ${device.productName}`);

		await device.open();

		if (device.configuration === null) {
			await device.selectConfiguration(1);
		}

		const printerInterface = device.configuration.interfaces.find((iface) =>
			iface.alternates.some((alt) => alt.interfaceClass === 7)
		);

		if (!printerInterface) {
			throw new Error('Selected device does not support standard USB printing interface.');
		}

		const interfaceNumber = printerInterface.interfaceNumber;
		await device.claimInterface(interfaceNumber);

		console.log('🔒 Interface successfully claimed. Ready to print!');
		return device;
	} catch (error) {
		console.error('❌ WebUSB Printer request failed:', error);
		return null;
	}
}

/**
 * 3. Fetches all paired devices and formats them into user-friendly names.
 * @returns {Promise<string[]>} Array of formatted printer string names
 */
export async function refreshPairedPrinters() {
	if (typeof window === 'undefined' || !navigator.usb) return [];

	try {
		const devices = await navigator.usb.getDevices();
		return devices.map((device) => {
			const cleanName = device.productName
				? device.productName.replace(/\0/g, '').trim()
				: 'Unknown Printer';
			return `${cleanName} (${device.vendorId}:${device.productId})`;
		});
	} catch (error) {
		console.error('Failed to load paired hardware routes', error);
		return [];
	}
}

/**
 * 4. Revokes WebUSB permissions for a printer by its formatted string name.
 * @param {string} printerName - The formatted string name of the printer to forget
 * @returns {Promise<boolean>} True if successfully forgotten, false otherwise
 */
export async function unpairPrinter(printerName) {
	if (typeof window === 'undefined' || !navigator.usb) return false;

	try {
		const devices = await navigator.usb.getDevices();

		const targetDevice = devices.find((d) => {
			const cleanName = d.productName ? d.productName.replace(/\0/g, '').trim() : 'Unknown Printer';
			const name = `${cleanName} (${d.vendorId}:${d.productId})`;
			return name === printerName;
		});

		if (targetDevice) {
			await targetDevice.forget();
			console.log(`❌ Revoked access to: ${printerName}`);
			return true;
		}
		return false;
	} catch (error) {
		console.error('Error forgetting device privileges', error);
		return false;
	}
}

/**
 * Finds a USBDevice using a formatted name string containing "(vendorId:productId)"
 * @param {string} formattedName - e.g., "USB Printer Port (1048:20497)"
 * @returns {Promise<USBDevice|null>} The matching USBDevice instance, or null
 */
export async function getDeviceByFormattedName(formattedName) {
	if (typeof window === 'undefined' || !navigator.usb) return null;

	// Regex looks for numbers inside parentheses separated by a colon
	const match = formattedName.match(/\((\d+):(\d+)\)/);
	if (!match) {
		console.error('Could not parse Vendor ID and Product ID from name.');
		return null;
	}

	// Convert the extracted strings into base-10 integers
	const vendorId = parseInt(match[1], 10);
	const productId = parseInt(match[2], 10);

	try {
		const devices = await navigator.usb.getDevices();

		// Find the exact hardware match in the browser's authorized list
		const targetDevice = devices.find(
			(device) => device.vendorId === vendorId && device.productId === productId
		);

		if (!targetDevice) {
			console.error(`Device ${vendorId}:${productId} is not currently paired or connected.`);
			return null;
		}

		return targetDevice;
	} catch (error) {
		console.error('Error retrieving USB devices:', error);
		return null;
	}
}

/**
 * Sends raw bytes or text to a specific parsed device string
 * @param {string} printerName - e.g., "USB Printer Port (1048:20497)"
 * @param {string|Uint8Array} printData - Text string OR raw ESC/POS byte array
 */
export async function sendPrintJob(printerName, printData) {
	const device = await getDeviceByFormattedName(printerName);
	if (!device) return;

	try {
		if (!device.opened) await device.open();

		if (device.configuration === null) {
			await device.selectConfiguration(1);
		}

		const printerInterface = device.configuration.interfaces.find((iface) =>
			iface.alternates.some((alt) => alt.interfaceClass === 7)
		);

		if (!printerInterface) {
			throw new Error('Device does not support standard USB printing protocol.');
		}

		const interfaceNumber = printerInterface.interfaceNumber;
		await device.claimInterface(interfaceNumber);

		const alternate = printerInterface.alternates.find((alt) => alt.interfaceClass === 7);
		const outEndpoint = alternate.endpoints.find((ep) => ep.direction === 'out');

		if (!outEndpoint) {
			throw new Error('No OUT endpoint found on this printer.');
		}

		// --- FIX: Safely process text vs raw binary bytes ---
		let dataBytes;
		if (printData instanceof Uint8Array) {
			dataBytes = printData;
		} else {
			// Fallback behavior for regular string text
			const encoder = new TextEncoder();
			dataBytes = encoder.encode(printData + '\n\n');
		}

		// Push raw binary array to the printer
		await device.transferOut(outEndpoint.endpointNumber, dataBytes);
		console.log('🖨️ Print job sent successfully!');

		// Wait 500ms for the hardware to process the feed/cut before shutting down
		await new Promise((resolve) => setTimeout(resolve, 500));

		await device.releaseInterface(interfaceNumber);
		await device.close();
	} catch (error) {
		console.error('Failed to execute print job:', error);
	}
}
