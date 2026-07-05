// src/lib/store/config.store.svelte.js

import { getFormattedTimestamp } from '$lib/utils/dateTime';
import { ESCPOSPrinter } from '$lib/utils/escpos';
import {
	refreshPairedPrinters,
	requestUsbPrinter,
	sendPrintJob,
	unpairPrinter
} from '$lib/utils/printer.svelte';
const defaultPairdDevices = await refreshPairedPrinters();

class ConfigStore {
	#config = $state(this.#getInitialConfig());

	async refreshPrinter() {
		const pairdDevices = await refreshPairedPrinters();
		this.#config.printer.options = ['-- Select Printer --', ...pairdDevices];
	}

	constructor() {
		$effect.root(() => {
			$effect(() => {
				if (typeof window !== 'undefined') {
					localStorage.setItem('app_config', JSON.stringify(this.#config));
				}
			});
		});
	}

	#getInitialConfig() {
		const defaultConfig = {
			gstBill: {
				label: 'Enable GST number',
				description: 'Show GST Number in printing receipt',
				value: false,
				type: 'boolean'
			},
			gstNumber: {
				label: 'GST Number',
				value: '',
				type: 'text',
				placeholder: 'Enter your GST registration number'
			},
			printerAccess: {
				label: 'Pair New Printer',
				description: 'Pair and Connect the new printer and save it',
				type: 'button',
				buttonText: 'Request Printer',
				action: async () => {
					await requestUsbPrinter();
					this.refreshPrinter();
				}
			},
			printer: {
				label: 'Printers',
				value: '-- Select Printer --',
				type: 'select',
				deletable: true,
				options: ['-- Select Printer --', ...defaultPairdDevices]
			},
			testPrint: {
				label: 'Test Print',
				description: 'Test the connected printer',
				type: 'button',
				buttonText: 'Run Test Print',
				action: () => {
					const receipt = new ESCPOSPrinter();
					receipt
						.reset()
						.align('center')
						.setTextSize(1, 1)
						.line('Print Testing')
						.dashedLine(20)
						.setTextSize(0, 0)
						.line(this.#config.printer.value)
						.line('Naruto Mens Wear')
						.line('Developed By: Tetacy')
						.line(getFormattedTimestamp())
						.feed(6)
						.cut();
					const binaryPayload = receipt.getRawBytes();
					sendPrintJob(this.#config.printer.value, binaryPayload);
				}
			}
		};

		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('app_config');
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					Object.keys(defaultConfig).forEach((key) => {
						if (parsed[key] && parsed[key].value !== undefined) {
							defaultConfig[key].value = parsed[key].value;
						}
						// Persist custom added options if they exist
						if (parsed[key] && parsed[key].options !== undefined) {
							defaultConfig[key].options = parsed[key].options;
						}
					});
					return defaultConfig;
				} catch (e) {
					console.error('Failed to parse config from localStorage', e);
				}
			}
		}
		return defaultConfig;
	}

	get value() {
		return this.#config;
	}

	// Dynamic method to add an option
	addOption(key, newOption) {
		if (this.#config[key] && !this.#config[key].options.includes(newOption)) {
			this.#config[key].options.push(newOption);
			this.#config[key].value = newOption; // Automatically select it
		}
	}

	// Dynamic method to delete an option
	deleteOption(key, optionToDelete) {
		if (this.#config[key] && this.#config[key].options) {
			this.#config[key].options = this.#config[key].options.filter((opt) => opt !== optionToDelete);
			if (key === 'printer') {
				unpairPrinter(optionToDelete);
			}
			// Reset selection to default if current active value was deleted
			if (this.#config[key].value === optionToDelete) {
				this.#config[key].value = this.#config[key].options[0] || '';
			}
		}
	}
}

export const configStore = new ConfigStore();
configStore.refreshPrinter();
