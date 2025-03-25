$(document).ready(function() {
    function createFolder(name, level) {
        return $(`
            <div class="folder-menu-item" data-level="${level}">
                <div class="folder-menu-header">
                    <span class="toggle-menu-icon">
						<img src="../assets/images/check-down.svg" alt="check">
					</span>
                    <span class="folder-menu-icon">
						<img src="../assets/images/folder.svg" alt="folder">
					</span>
                    <span class="folder-menu-name">${name}</span>
                </div>
                <div class="folder-menu-content hidden"></div>
            </div>
        `);
    }

    function initFolderStates() {
        $('.folder-menu-item').each(function() {
            const $content = $(this).children('.folder-menu-content');
            if ($content.length && !$content.children().length) {
                $(this).find('.toggle-menu-icon').first().hide();
            }
        });
    }

    $('.folder-menu-tree').on('click', '.folder-menu-header', function(e) {
        e.stopPropagation();
        
        const $folderItem = $(this).parent();
        const $content = $folderItem.children('.folder-menu-content');
        const $toggleIcon = $(this).find('.toggle-menu-icon');
        
        if ($content.length && $content.children().length) {
            $content.toggleClass('hidden');
            
            if ($content.hasClass('hidden')) {
                $toggleIcon.addClass('-rotate-90');
            } else {
                $toggleIcon.removeClass('-rotate-90');
            }
        }
    });

    // Function for adding a new folder to the specified folder
    function addFolderTo($parentFolder, name) {
        const parentLevel = parseInt($parentFolder.attr('data-level'));
        const $newFolder = createFolder(name, parentLevel + 1);
        $parentFolder.children('.folder-menu-content').append($newFolder);
        
        $parentFolder.find('.toggle-menu-icon').first().show();
        return $newFolder;
    }

    // const $newFolder = addFolderTo($('.folder-menu-item').first(), 'New Dynamic Folder');
    
    initFolderStates();
});