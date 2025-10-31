const popupsData = [
	{
		id: "disable-downloads",
		title: "Disable downloads to prevent unwanted copies",
		description: [
			"Ensure your files can only be viewed and not saved without your permission.",
		],
		listItems: [
			{
				icon: "icon-disabled-download",
				title: "View-only sharing",
				description:
					"Let recipients preview your files without risking unwanted copies.",
			},
			{
				icon: "icon-file",
				title: "Per-file restriction",
				description: "Disable downloads for an individual file at any time.",
			},
			{
				icon: "icon-files",
				title: "Workspace-wide",
				description:
					"Apply the restriction to all new uploads across your workspace.",
			},
		],
	},
	{
		id: "disable-comments",
		title: "Control feedback by disabling comments",
		description: [
			"Disable comments for files meant for sharing and not collaboration.",
		],
		listItems: [
			{
				icon: "icon-disabled-comments",
				title: "Focus on sharing",
				description:
					"Prevent unwanted feedback and close discussions on old files.",
			},
			{
				icon: "icon-file",
				title: "Per-file control",
				description: "Turn off comments on individual files whenever needed.",
			},
			{
				icon: "icon-files",
				title: "Workspace-wide",
				description: "Disable comments for all new uploads in your Workspace.",
			},
		],
	},
	{
		id: "unlimited-comments",
		title: "Comment and collaborate without limits",
		description: [
			"Free users are limited to five comments per file. Keep conversations going by unlocking unlimited comments on your files with the Plus plan.",
		],
	},
	{
		id: "restore-deleted-files",
		title: "Restore deleted files",
		description: [
			"Accidentally removed something? Files deleted from your account are stored in Trash for 7 days and can be easily restored with Jumpshare Plus.",
		],
	},
	{
		id: "restore-deleted-files",
		title: "Restore 'Screen Recording 9-15-25 03-40 PM.mp4'",
		description: [
			"Accidentally removed a file? Files deleted from your account are stored in Trash for 7 days and can be easily restored with Jumpshare Plus.",
		],
	},
	{
		id: "file-size-limit",
		title: "File size exceeds your plan’s 250 MB limit",
		description: [
			"The file <strong>'ShineLight_03-12.mov'</strong> cannot be uploaded. Upgrade to the Plus plan to upload files larger than 250 MB.",
		],
	},
	{
		id: "file-size-limit-business",
		title: "File size exceeds your plan’s 10 GB limit",
		description: [
			"The file <strong>'ShineLight_03-12.mov'</strong> cannot be uploaded. Upgrade to the Business plan to upload files larger than 10 GB.",
		],
		upgradeButtonText: "Upgrade to Business",
		upgradeButtonClass: "btn-violet",
	},
	{
		id: "file-size-limit-enterprise",
		title: "File size exceeds your plan’s 20 GB limit",
		description: [
			"The file <strong>'ShineLight_03-12.mov'</strong> cannot be uploaded. Upgrade to the Business plan to upload files larger than 20 GB.",
		],
		upgradeButtonText: "Upgrade to Enterprise",
		upgradeButtonClass: "btn-yellow",
	},
	{
		id: "file-upload-limit-reached",
		title: "File upload limit reached",
		description: [
			"You’ve hit the free plan limit of 50 active files. Upgrade to the Plus plan to unlock unlimited uploads.",
		],
	},
	{
		id: "upgrade-to-plus-out-of-storage-space",
		title: "You’re out of storage space",
		description: [
			"The file <strong>'ShineLight_03 - 12.mov'</strong> cannot be uploaded.",
			"You’ve reached the storage limit for the Free plan. Upgrade to the Plus plan to get 2 TB storage, larger file uploads, and a number of advanced features.",
		],
	},
	{
		id: "upgrade-to-business-out-of-storage-space",
		title: "You’re out of storage space",
		file: {
			description: "The following files could not be uploaded:",
			fileNames: [
				{
					name: "ShineLight_03-12.mov",
				},
				{
					name: "Promo_poster.png",
				},
			],
		},
		description: [
			"You’ve reached the storage limit for the Plus plan. Upgrade to the Business plan to get 3 TB storage, larger file uploads, and advanced collaboration features.",
		],
		upgradeButtonText: "Upgrade to Business",
		upgradeButtonClass: "btn-violet",
	},
	{
		id: "upgrade-to-enterprise-out-of-storage-space",
		title: "You’re out of storage space",
		file: {
			description: "The following files could not be uploaded:",
			fileNames: [
				{
					name: "ShineLight_03-12.mov",
				},
				{
					name: "Promo_poster.png",
				},
			],
		},
		description: [
			"You’ve reached the storage limit for the Business plan. Upgrade to the Enterprise plan for 10 TB storage, no file size limits, and enterprise-standard security.",
		],
		upgradeButtonText: "Upgrade to Enterprise",
		upgradeButtonClass: "btn-yellow",
	},
	{
		id: "upgrade-to-plus",
		title: "Upgrade to upload executable files",
		description: [
			"For security reasons, uploading executable files is disabled on the free plan. Upgrade to the Plus plan to lift this restriction.",
		],
	},
	{
		id: "upgrade-to-business",
		title: "Upgrade to upload executable files",
		description: [
			"For security reasons, uploading executable files is disabled on the free trial. Upgrade to the Business plan to lift this restriction.",
		],
		upgradeButtonText: "Upgrade to Business",
		upgradeButtonClass: "btn-violet",
	},
	{
		id: "enable-direct-linking",
		title: "Enable direct linking",
		description: [
			"Link directly to any file to bypass the file viewer. Upgrade to the Plus plan to unlock this feature.",
		],
	},
	{
		id: "get-business-now",
		title: "Get Business now",
		description: [
			"There are 7 days remaining in your 14-day free trial. You will automatically be upgraded to Jumpshare Business when the trial period ends. Do you want to purchase Business now?",
		],
		upgradeButtonText: "Upgrade to Business",
		upgradeButtonClass: "btn-violet",
	},
];

const showAllModal = true;

function generatePopup(popupData) {
	const {
		id,
		file,
		title,
		description,
		upgradeButtonText,
		upgradeButtonClass,
		listItems,
	} = popupData;
	const popup = `
		<div class="modal-dialog modal-bs modal-${id} max-w-[25.25rem] w-full ${showAllModal ? "" : "hidden"}">
			<button type="button" class="close pull-right" data-dismiss="modal" data-dialog-close">
				<span class="icn-close bg-white hover:bg-gray-200"></span>
				<span class="sr-only">Close modal</span>
			</button>
			<div class="modal-content py-9 px-10 max-lg:px-6 max-lg:pb-6">
				<h3 class="text-2xl/9 font-semibold mb-5">${title}</h3>
				${
					file && file.fileNames && file.fileNames.length > 0
						? `
						<p class="text-sm mb-2">${file.description}</p>
						<ul class="list-disc list-inside pl-4 text-sm mb-2 space-y-1">
							${file.fileNames.map((fileName) => `<li class="font-bold text-sm">${fileName.name}</li>`).join("")}
						</ul>
						`
						: ""
				}
				${
					description && description.length > 0
						? `<div class="space-y-2">
							${description.map((item) => `<p class="text-sm [&_strong]:font-semibold">${item}</p>`).join("")}</div>`
						: ""
				}
				${
					listItems && listItems.length > 0
						? `
						<ul class="flex flex-col gap-4 mt-4 [&_strong]:font-semibold [&>li]:flex [&>li]:items-start [&>li]:gap-2 [&_svg]:shrink-0">
							${listItems
								.map(
									(item) => `
								<li class="text-sm">
									<svg class="icon icon-m">
										<use href="#${item.icon}"></use>
									</svg>
									<p><strong>${item.title}:</strong> ${item.description}</p>
								</li>
							`,
								)
								.join("")}
							</ul>`
						: ""
				}
				<div class="flex flex-col gap-2 mt-8">
					<button type="button" class="btn ${upgradeButtonClass || "btn-primary"} font-semibold text-sm h-10 w-full">${upgradeButtonText || "Upgrade to Plus"}</button>
					<button type="button" class="btn btn-border-default text-sm h-10 w-full">Compare all plans</button>
				</div>
			</div>
		</div>
	`;
	return popup;
}

$("document").ready(function () {
	popupsData.forEach((popupData) => {
		const popup = generatePopup(popupData);
		$("#lightbox-preview").append(popup);
	});
});
